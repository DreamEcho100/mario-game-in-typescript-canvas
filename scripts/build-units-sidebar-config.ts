import fs from "node:fs";
import path from "node:path";

// format title by replacing hyphens and underscores with spaces and capitalizing words
function formatTitle(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// loop through `./src/routes/units` directory and create sidebar items
// if it's a `mdx` or `md` file, create a sidebar item with the file name as the title and the path as the link
// If it's a directory, create a sidebar item with the directory name as the title, collapsed as true, and recursively call the function to get the items
function generateSidebarItems(dirPath: string, endPathAcc: string[]): any[] {
  // const items: any[] = [];
  const filesAndDirs = fs.readdirSync(path.resolve(process.cwd(), dirPath));

  const dirs = [];
  const files = [];

  for (const name of filesAndDirs) {
    const fullPath = `${dirPath}/${name}`;
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      dirs.push({
        title: formatTitle(name),
        collapsed: true,
        items: generateSidebarItems(fullPath, endPathAcc),
      });
    } else if (
      stats.isFile() &&
      (name.endsWith(".mdx") || name.endsWith(".md"))
    ) {
      const title = formatTitle(name.replace(/\.mdx?$/, ""));
      const link = fullPath.replace("./src/routes", "").replace(/\.mdx?$/, "");
      files.push({ title, link });
      endPathAcc.push(link);
    }
  }

  return [...dirs, ...files];
}

const endPathAcc: string[] = [];
const unitsItems = generateSidebarItems("./src/routes/units", endPathAcc);

// set { unitsItems, endPathAcc } to a json file at `./script/units-sidebar-config.json`
fs.writeFileSync(
  path.resolve(process.cwd(), "scripts/units-sidebar-config.json"),
  JSON.stringify({ unitsItems, endPathAcc }, null, 2)
);
