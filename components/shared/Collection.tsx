"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
import { IImage } from "@/lib/database/models/image.model";
import { formUrlQuery, getDate } from "@/lib/utils";

import { Button } from "../ui/button";

import { Search } from "./Search";

export const Collection = ({
  transactions,
  totalPages=1 ,
  page,
  hasSearch = false,
}: {
  transactions: ITRANSACTIONS[];
  totalPages?: number;
  page: number;
  hasSearch?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // PAGINATION HANDLER
  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Transactions</TabsTrigger>
          <TabsTrigger value="password">Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Table>
            <TableCaption>A list of your recent Transactions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">OrderId</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-center">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                <>
                  {transactions.map((transaction,index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{transaction.razorpayOrderId}</TableCell>
                      <TableCell>{transaction.plan}</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell>{transaction.tokens}</TableCell>
                      <TableCell className="text-right">{transaction.status}</TableCell>
                      <TableCell className="text-right">{getDate(transaction.createdAt)}</TableCell>
                      
                    </TableRow>
                  ))}
                </>
              ) : (
                <div className="collection-empty">
                  <p className="p-20-semibold">Empty List</p>
                </div>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="password">
          <div className="collection-empty">
            <p className="p-20-semibold">Empty List</p>
          </div>
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button disabled={Number(page) <= 1} className="collection-btn" onClick={() => onPageChange("prev")}>
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages}
            >
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};


