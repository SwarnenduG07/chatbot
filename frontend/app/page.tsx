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
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

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
    setResponse(""); // Clear previous response
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "https://chatbot-weld-eight-81.vercel.app/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      // Process streamed text
      if (reader) {
        let resultText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resultText += decoder.decode(value, { stream: true });
          setResponse((prev) => prev + resultText); // Append streamed chunk
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent text-7xl font-thin">
            AI Text Generator
          </h1>
          <p className="mt-2 text-gray-300">Enter your prompt below to generate text</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-zinc-100">Your Prompt</FormLabel>
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-br from-purple-600 to-fuchsia-400 hover:bg-gradient-to-r hover:from-fuchsia-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
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
            <h2 className="text-xl font-medium text-neutral-100">Generated Result:</h2>
            <SyntaxHighlighter language="javascript, typescript, java, python , c , c++ , plaintext" style={dracula}>
              {response}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
