import { defineConfig } from "@solidjs/start/config";
import { withSolidBase } from "@kobalte/solidbase/config";
// Allow JSON module imports
import unitsSidebarConfig from "./src/config/units-sidebar.json";

export default defineConfig(
  withSolidBase(
    // SolidStart config
    {
      solid: {
        babel: {
          compact: false,
        },
      },
      ssr: true,
      server: {
        prerender: {
          crawlLinks: true,
          routes: ["/", "/about", ...unitsSidebarConfig.endPathAcc],
        },
      },
    },
    // SolidBase config
    {
      title: "Mario Game TypeScript Canvas Course",
      titleTemplate: ":title - Mario Game Course",
      description:
        "Learn to build a Mario-style 2D platformer using TypeScript and HTML5 Canvas. A comprehensive curriculum from beginner to advanced.",
      logo: "/logo.png", // Add your logo to public folder
      lang: "en-US",

      // Optional: Add edit link to GitHub
      // editPath: "https://github.com/your-username/your-repo/edit/main/src/routes/:path",

      // Optional: Show last updated timestamp
      lastUpdated: {
        dateStyle: "short",
        timeStyle: "short",
      },

      markdown: {
        // Table of contents configuration
        toc: {
          minDepth: 2,
          maxDepth: 4,
        },
        // Expressive code configuration for better code blocks
        expressiveCode: {
          themes: ["github-dark", "github-light"],
          styleOverrides: {
            borderRadius: "0.5rem",
          },
        },
      },

      themeConfig: {
        // Navigation links in header
        nav: [
          {
            text: "Home",
            link: "/",
          },
          {
            text: "About",
            link: "/about",
          },
          {
            text: "Units",
            link: "/units",
          },
        ],

        // Social links in footer
        socialLinks: {
          github:
            "https://github.com/DreamEcho100/mario-game-in-typescript-canvas",
          // discord: "https://discord.gg/your-server", // Optional
        },

        // Search configuration (optional - requires Algolia)
        // search: {
        //   provider: "algolia",
        //   options: {
        //     appId: "YOUR_APP_ID",
        //     apiKey: "YOUR_API_KEY",
        //     indexName: "YOUR_INDEX_NAME",
        //   },
        // },

        // Sidebar configuration
        sidebar: {
          "/": [
            {
              title: "Overview",
              collapsed: false,
              items: [
                {
                  title: "Home",
                  link: "/",
                },
                {
                  title: "About This Course",
                  link: "/about",
                },
              ],
            },
            {
              title: "Course Units",
              collapsed: false,
              items: unitsSidebarConfig.unitsItems,
            },
          ],
        },

        // Footer configuration
        footer: true, // Set to false to disable, or customize with message/copyright
      },
    }
  )
);
