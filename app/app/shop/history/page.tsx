"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer"
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// function to fetch transaction
const fetchTransactionHistory = async ({ pageParam = 0 }) => {
  const limit = 10;
  const skip = pageParam;
  const response = await fetch(`/api/transactions/history?skip=${skip}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  return await response.json();
}

export default function TransactionHistory() {
  const router = useRouter();
  const [ref, inView] = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["transactionHistory"],
    queryFn: fetchTransactionHistory,
    initialPageParam: 0, getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      // Check if we've loaded all items
      return pagination.skip + pagination.limit < pagination.total ?
        pagination.skip + pagination.limit :
        undefined;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500">Success</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const transactions = data?.pages.flatMap(page => page.transactions) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => router.push("/app/shop")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
      </div>

      {isError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p>Failed to load transaction history. Please try again later.</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">You haven&apos;t made any purchases yet.</p>
          <Button onClick={() => router.push("/app/shop")}>Browse Token Packs</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const isLastItem = index === transactions.length - 1;

            return (
              <Card
                key={transaction.id}
                ref={isLastItem ? ref : undefined}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">
                        {transaction.tokenPack.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Order ID: {transaction.midtransOrderId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </p>
                        <span className="text-xs text-gray-400">
                          ({formatTimeAgo(transaction.createdAt)})
                        </span>
                      </div>
                      <p className="mt-1 font-medium">
                        IDR {transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(transaction.status)}
                      <p className="text-sm font-medium">
                        {transaction.tokenPack.tokens} Tokens
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <p className="text-gray-500">Loading more...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
