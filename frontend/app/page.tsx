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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Text Generator </h1>
          <p className="mt-2 text-gray-600">Enter your prompt below to generate text</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Your Prompt</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Enter your prompt here... (e.g., 'Write a story about...')"
                      className="w-full h-32 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate"
              )}
            </button>
          </form>
        </Form>

        {response && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-medium text-gray-900">Generated Result:</h2>
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <p className="whitespace-pre-wrap text-gray-800">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
