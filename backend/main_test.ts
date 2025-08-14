import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { fetchHomeInfo } from "./services/fetchHomeInfoService.ts";

Deno.test("API Data Test", async () => {
  const response = await fetch("http://localhost:8000/api/data");
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.message, "Hello from Deno!");
});

Deno.test("fetchHomeInfo should return content of text file", async () => {
  const mockRequest = new Request("http://localhost:8000/api/home", {
    method: "GET",
  });

  const response = await fetchHomeInfo(mockRequest);
  const responseBody = await response.json();

  assertEquals(response.status, 200);
  assertEquals(typeof responseBody.text, "string");
  assertEquals(responseBody.text.length > 0, true);
});

