"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

export default function Home() {
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(data: { message: string }) {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const result = await response.json();
      setResponse(result.response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-md space-y-8">
        {response && (
          <div className="rounded-lg bg-gray-100 p-4">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <input
                      placeholder="Type your message..."
                      className="w-full rounded-md border p-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
