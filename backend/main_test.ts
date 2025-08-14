import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

Deno.test("API Data Test", async () => {
  const response = await fetch("http://localhost:8000/api/data");
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.message, "Hello from Deno!");
});

