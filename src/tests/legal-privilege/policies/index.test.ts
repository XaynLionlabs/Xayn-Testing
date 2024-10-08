import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { sendToNoxtua } from "../../..";
import { globalSetup, tenantId, token } from "../../setupTest";
import { NoxtuaResponse } from "../../../lib/types";
import { evaluateNoxtuaResponse } from "../../../ai/EvaluateNoxtuaResponse";
import * as fs from "fs";
import * as path from "path";
import { combineResponses, generateLogFileName } from "../../../lib/utils";
import {
  evaluateResponsesAndLog,
  getNoxtuaResponses,
  writeLogs,
} from "../../../lib/testHelpers";

dotenv.config();

let aiResponses: NoxtuaResponse[] = [];
let testResults: string[] = [];
let ratingResults: string[] = [];

// Queries Noxtua co-pilot for updated answers to various forms of the same question
const questions = [
  "How does Noxtua develop policies for handling drafts to ensure privilege?",
  "How can we create policies for managing drafts to maintain legal privilege?",
  "What steps should be taken to establish policies for handling drafts while preserving privilege?",
  "How do we develop guidelines for dealing with drafts to ensure they remain privileged?",
  "What measures can be implemented to handle drafts in a way that protects legal privilege?",
];

// Test suite
describe("Testing the legal privilege policies for Noxtua", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    await globalSetup();
    testResults.push("gathering the ai responses for this test");
    aiResponses = await getNoxtuaResponses(questions, token, tenantId);
    testResults.push("ai responses gathered");
  }, 60000);

  it("all aiResponses for policies in legal privilege must be present and should have a question and answer property", async () => {
    expect(aiResponses).toBeDefined();
    expect(aiResponses.length).toBeGreaterThan(0);
    expect(aiResponses.length).toEqual(questions.length);

    for (let i = 0; i < questions.length; i++) {
      expect(aiResponses[i]).toHaveProperty("question");
      expect(aiResponses[i]).toHaveProperty("answer");
    }
    testResults.push("all responses have a property of question and answer");
    aiResponses.forEach((response) => {
      testResults.push(
        `Question: ${response.question}\nAnswer: ${response.answer}\n`
      );
    });

    testResults.push(`Test 1: All responses are defined and correct.`);
  });

  it("eu rules analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);

  afterAll(async () => {
    await writeLogs(
      aiResponses,
      testResults,
      ratingResults,
      "legal-privilege/policies"
    );
  });
});
