{\rtf1\ansi\ansicpg1252\cocoartf2759
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### SYSTEM MANIFEST: BUNJUMUN-MAZE-95\
\
**1. THE HARDWARE CHASSIS (BASE ARCHITECTURE)**\
* **Source Registry:** https://github.com/x86matthew/Playable3DMaze.git\
* **Workflow Protocol:** **GitHub-First.** Clone the source engine into a new, clean repository. All development must occur directly within the Git-tracked environment to ensure a Single Source of Truth.\
* **The Mission:** Refactor the static maze into a **Dynamic Spatial CMS**. Decouple the engine from wall data to allow the **Curator Algorithm** to inject "Picture Frame" modules based on an external `gallery.json` manifest.\
\
**2. SECURITY PROTOCOL (THE PASSWORD METHOD)**\
* **Secret Key Storage:** Implement the **"Password-Protected Environment"** strategy.\
* **Implementation:** The Admin UI must prompt for a "System Password" to unlock a locally stored (localStorage) **GitHub Personal Access Token (PAT)**. No raw tokens or keys are to be hardcoded or committed to the repository.\
\
**3. THE RIG & SPACING ALGORITHM**\
* **The Scanner:** A grid-array traversal logic identifying "Straightaways" (wall segments >= 3 units).\
* **The Anchor:** Mount 3D Picture Frames at `index + 1` of valid segments.\
* **The Buffer:** Enforce a strict 5-unit "Dead Zone" between exhibits to maintain the eerie, spacious Windows 95 screensaver aesthetic.\
* **The Nervous System:** `gallery.json` is the Single Source of Truth, updated via **GitHub API (PUT requests)**.\
\
**4. ADMIN CONSOLE: THE MULTI-INPUT PORT**\
The Admin Mode provides a "New Exhibit" interface with four ingestion methods:\
* **Paste Raw HTML:** String injection stored in JSON.\
* **Upload HTML File:** File-picker to convert .html content into strings.\
* **Insert Widgets:** Support for iframe snippets (YouTube, etc.).\
* **External Links:** URL input wrapped in a "Bunjumun-branded" frame.\
* **Asset Optimization:** Client-side Canvas resizer to cap Exhibit Thumbnails at **800px width** before Base64 conversion to prevent JSON bloat.\
\
**5. EXECUTION LOGIC**\
* **UI Layering:** Admin Console and Exhibit Portals must reside in a **Top-Level Shadow DOM** to bypass 3D mouse-lock and prevent z-index bleeding.\
* **Resource Management:** Exhibit "launching" is a seamless SPA-style overlay. The Maze Engine must **pause its requestAnimationFrame** when a portal is active to conserve system resources.\
\
}