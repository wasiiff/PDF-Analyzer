import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const pdfApi = createApi({
  reducerPath: 'pdfApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_SERVER }),
  endpoints: (builder) => ({
    uploadPdf: builder.mutation<{ _id: string; summary: string; category: string; highlights: string[] }, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    askQuestion: builder.mutation<{ answer: string }, { docId: string; question: string }>({
      query: ({ docId, question }) => ({
        url: `/documents/${docId}/ask`,
        method: 'POST',
        body: { question },
      }),
    }),
  }),
});

export const { useUploadPdfMutation, useAskQuestionMutation } = pdfApi;
