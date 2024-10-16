import { useState, useRef, useEffect } from "react";
import { useSubtitles } from "@/hooks/use-subtitles";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ArrowLeftRight,
  EditIcon,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { updateProject } from "@/lib/actions/magicsubs.action";
import { useParams } from "next/navigation";

const Subtitles = () => {
  const { subtitles, setSubtitles } = useSubtitles();
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [editedStartTime, setEditedStartTime] = useState("");
  const [editedEndTime, setEditedEndTime] = useState("");
  const [wordIndex, setWordIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isTransitionsDialogOpen, setIsTransitionsDialogOpen] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState("");
  const [transitionIndex, setTransitionIndex] = useState<number | null>(null);
  const [selectedBroll, setSelectedBroll] = useState("");
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const params = useParams();

  console.log(subtitles);

  useEffect(() => {
    brolls.forEach((broll) => {
      if (videoRefs.current[broll.name]) {
        videoRefs.current[broll.name]!.play();
      }
    });
  }, [isTransitionsDialogOpen]);

  const transitions = [
    { name: "Wipe", transition: wipe },
    { name: "ClockWipe", transition: clockWipe },
    { name: "Flip", transition: flip },
    { name: "Slide", transition: slide },
  ];

  const brolls = [
    { name: "Broll 1", broll: "/sample1.mp4" },
    { name: "Broll 2", broll: "/sample2.mp4" },
  ];

  useEffect(() => {
    if (isTransitionsDialogOpen) {
      brolls.forEach((broll) => {
        const videoElement = videoRefs.current[broll.name];
        if (videoElement) {
          videoElement.load();
          videoElement
            .play()
            .catch((error) => console.error("Error playing video:", error));
        }
      });
    }
  }, [isTransitionsDialogOpen]);

  const handleEdit = (subtitle: any, index: number) => {
    setSelectedSubtitle(subtitle);
    setEditedText(subtitle.word.trim());
    setEditedStartTime(subtitle.start.toString());
    setEditedEndTime(subtitle.end.toString());
    setWordIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteIndex === null) return;
    const updatedSubtitles = subtitles.filter((_, i) => i !== deleteIndex);
    setSubtitles(updatedSubtitles);
    if (params.projectId) {
      await updateProject(params.projectId as string, {
        transcription: JSON.stringify(updatedSubtitles),
      });
    }
    setIsDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleSave = async (index: number | null) => {
    if (index === null) return;
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index] = {
      ...updatedSubtitles[index],
      word: editedText,
      start: parseFloat(editedStartTime),
      end: parseFloat(editedEndTime),
    };
    if (params.projectId) {
      await updateProject(params.projectId as string, {
        transcription: JSON.stringify(updatedSubtitles),
      });
    }
    setSubtitles(updatedSubtitles);
    setIsDialogOpen(false);
    setEditedText("");
    setEditedStartTime("");
    setEditedEndTime("");
    setWordIndex(null);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditedText("");
    setEditedStartTime("");
    setEditedEndTime("");
    setWordIndex(null);
  };

  const handleTransitionClick = (index: number) => {
    setTransitionIndex(index);
    setSelectedBroll(subtitles[index].broll || "");
    setSelectedTransition(subtitles[index].transition || "");
    setIsTransitionsDialogOpen(true);
  };

  const handleTransitionSave = () => {
    if (transitionIndex === null) return;
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[transitionIndex] = {
      ...updatedSubtitles[transitionIndex],
      transition: selectedTransition,
      broll: selectedBroll,
    };
    setSubtitles(updatedSubtitles);
    setIsTransitionsDialogOpen(false);
    setSelectedTransition("");
    setSelectedBroll("");
    setTransitionIndex(null);
  };

  return (
    <>
      <div className="flex justify-center space-x-2 mb-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Grid
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </Button>
      </div>
      <ScrollArea className="h-[400px] w-full p-2">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 lg:grid-cols-3 gap-2"
              : "flex flex-col space-y-2"
          }
        >
          {subtitles.map((subtitle, index) =>
            viewMode === "grid" ? (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardContent className="p-2">
                      <p className="text-lg font-semibold mb-2">
                        {subtitle.word}
                      </p>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Start: {subtitle.start}s</span>
                        <span>End: {subtitle.end}s</span>
                      </div>
                    </CardContent>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => handleEdit(subtitle, index)}
                    className="cursor-pointer flex items-center gap-x-2"
                  >
                    <EditIcon className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleDeleteClick(index)}
                    className="cursor-pointer flex items-center gap-x-2"
                  >
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleTransitionClick(index)}
                    className="cursor-pointer flex items-center gap-x-2"
                  >
                    <ArrowLeftRight className="size-4" /> Add BRolls and
                    Transitions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Card key={index} className="w-full">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold mb-2">
                      {subtitle.word}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Start: {subtitle.start}s</span>
                      <span className="ml-4">End: {subtitle.end}s</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subtitle, index)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransitionClick(index)}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </ScrollArea>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Subtitle</DialogTitle>
            <DialogDescription>
              Edit the text and start time of the subtitle
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <label htmlFor="text" className="font-bold">
                Text
              </label>
              <Input
                id="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label htmlFor="startTime" className="font-bold">
                Start Time (in sec)
              </label>
              <Input
                id="startTime"
                type="number"
                step="0.1"
                value={editedStartTime}
                onChange={(e) => setEditedStartTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label htmlFor="endTime" className="font-bold">
                End Time (in sec)
              </label>
              <Input
                id="endTime"
                type="number"
                step="0.1"
                value={editedEndTime}
                onChange={(e) => setEditedEndTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => handleSave(wordIndex)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              word from the subtitles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={isTransitionsDialogOpen}
        onOpenChange={setIsTransitionsDialogOpen}
      >
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Broll and Transitions</DialogTitle>
            <DialogDescription>
              Select a transition and broll for this subtitle.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <h1>Transitions</h1>
              <Select
                value={selectedTransition}
                onValueChange={setSelectedTransition}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a transition" />
                </SelectTrigger>
                <SelectContent>
                  {transitions.map((transition) => (
                    <SelectItem
                      key={transition.name}
                      value={transition.name}
                      className="cursor-pointer"
                    >
                      {transition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <h1>Broll</h1>
              <div className="grid grid-cols-2 gap-2">
                {brolls.map((broll) => (
                  <div
                    key={broll.name}
                    className={`cursor-pointer rounded-md overflow-hidden ${
                      selectedBroll === broll.broll
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedBroll(broll.broll)}
                  >
                    <video
                      // @ts-ignore
                      ref={(el) => (videoRefs.current[broll.name] = el)}
                      src={broll.broll}
                      className="w-full h-24 object-cover rounded-lg"
                      loop
                      muted
                      playsInline
                      controls
                    />
                    <p className="text-center text-sm mt-1">{broll.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsTransitionsDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleTransitionSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Subtitles;
