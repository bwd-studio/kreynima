import { test, expect, type Page } from "@playwright/test";

async function draw(page: Page, points: number[][]) {
  const bounds = await page
    .getByRole("img", { name: "Drawing canvas" })
    .boundingBox();
  if (!bounds) throw new Error("Canvas missing");
  const position = (p: number[]) => ({
    x: bounds.x + (p[0] * bounds.width) / 960,
    y: bounds.y + (p[1] * bounds.height) / 540,
  });
  const first = position(points[0]);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (const p of points.slice(1)) {
    const v = position(p);
    await page.mouse.move(v.x, v.y, { steps: 8 });
  }
  await page.mouse.up();
}
test("draw, color, width, layers, visibility, ordering, erasing and undo/redo work through the canvas", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /KREYNIMA/ })).toBeVisible();
  await page.getByLabel("Brush color").fill("#2277cc");
  await page.getByLabel("Brush size").fill("18");
  await draw(page, [
    [120, 160],
    [250, 100],
    [350, 190],
  ]);
  const strokes = page.locator("[data-stroke-id]");
  await expect(strokes).toHaveCount(1);
  await expect(strokes.first()).toHaveAttribute("stroke", "#2277cc");
  await expect(strokes.first()).toHaveAttribute("stroke-width", "18");
  await page.getByRole("button", { name: "Add layer", exact: true }).click();
  await page.getByLabel("Brush color").fill("#e85944");
  await draw(page, [
    [160, 80],
    [260, 200],
    [360, 130],
  ]);
  await expect(strokes).toHaveCount(2);
  const top = page.locator("g[data-layer-id]").last();
  const topId = await top.getAttribute("data-layer-id");
  await page.getByLabel("Show Layer 2", { exact: true }).uncheck();
  await expect(top).toHaveAttribute("visibility", "hidden");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(top).toHaveAttribute("visibility", "visible");
  await page
    .getByRole("button", { name: "Move Layer 2 down", exact: true })
    .click();
  await expect(page.locator("g[data-layer-id]").first()).toHaveAttribute(
    "data-layer-id",
    topId!,
  );
  await page.getByLabel("Selected layer name").fill("Red ink");
  await page.getByLabel("Selected layer name").press("Enter");
  await expect(
    page.getByRole("button", { name: "Red ink", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Eraser", exact: true }).click();
  await draw(page, [
    [250, 40],
    [250, 250],
  ]);
  await expect(strokes).toHaveCount(1); // The blue stroke on the OTHER layer survives.
  await expect(strokes.first()).toHaveAttribute("stroke", "#2277cc");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(strokes).toHaveCount(2);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(strokes).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Brush", exact: true }).click();
  await page.screenshot({
    path: "test-results/drawing-studio.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("single click draws a dot; canceled gestures do not commit; hidden layers reject input", async ({
  page,
}) => {
  await page.goto("/");
  await draw(page, [[100, 100]]);
  await expect(page.locator("circle[data-stroke-id]")).toHaveCount(1);
  const canvas = page.getByRole("img", { name: "Drawing canvas" });
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Canvas missing");
  await page.mouse.move(bounds.x + 30, bounds.y + 30);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 80, bounds.y + 60);
  await expect(page.locator('[data-stroke-id="preview"]')).toHaveCount(1);
  await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(page.locator("[data-stroke-id]")).toHaveCount(1);
  await page.getByLabel("Show Layer 1", { exact: true }).uncheck();
  await draw(page, [
    [200, 100],
    [300, 100],
  ]);
  await expect(
    page.getByRole("status", { name: "Drawing status" }),
  ).toContainText("Show the selected layer");
  await expect(page.locator("[data-stroke-id]")).toHaveCount(1);
});
test("scaled canvas coordinates remain in project units and new edits clear redo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 760, height: 950 });
  await page.goto("/");
  await draw(page, [
    [480, 270],
    [600, 350],
  ]);
  const stroke = page.locator("path[data-stroke-id]");
  await expect(stroke).toHaveCount(1);
  const path = await stroke.getAttribute("d");
  const match = path?.match(/^M([\d.]+) ([\d.]+)/);
  expect(match).toBeTruthy();
  expect(Number(match![1])).toBeCloseTo(480, 0);
  expect(Number(match![2])).toBeCloseTo(270, 0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await draw(page, [
    [200, 200],
    [300, 250],
  ]);
  await expect(
    page.getByRole("button", { name: "Redo", exact: true }),
  ).toBeDisabled();
});
