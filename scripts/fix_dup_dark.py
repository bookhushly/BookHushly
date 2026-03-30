"""Remove duplicate dark: text color variants added by previous scripts."""
import os, re, subprocess

BASE = r"c:\Users\D\Desktop\bookhushly"

# Find all files with duplicates
result = subprocess.run(
    ["grep", "-rln",
     "dark:text-gray-400 dark:text-gray-500",
     "--include=*.jsx",
     os.path.join(BASE, "app/(admin)"),
     os.path.join(BASE, "app/(dashboard)"),
     os.path.join(BASE, "app/(vendor)"),
     os.path.join(BASE, "components/shared"),
    ],
    capture_output=True, text=True
)

files = [f.strip() for f in result.stdout.strip().splitlines() if f.strip()]

# Also find reverse order
result2 = subprocess.run(
    ["grep", "-rln",
     "dark:text-gray-500 dark:text-gray-400",
     "--include=*.jsx",
     os.path.join(BASE, "app/(admin)"),
     os.path.join(BASE, "app/(dashboard)"),
     os.path.join(BASE, "app/(vendor)"),
     os.path.join(BASE, "components/shared"),
    ],
    capture_output=True, text=True
)
files += [f.strip() for f in result2.stdout.strip().splitlines() if f.strip()]
files = list(set(files))

fixed = 0
for path in files:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    original = content
    # Remove duplicate: "dark:text-gray-400 dark:text-gray-500" → keep first
    content = content.replace("dark:text-gray-400 dark:text-gray-500", "dark:text-gray-400")
    # Remove duplicate: "dark:text-gray-500 dark:text-gray-400" → keep first
    content = content.replace("dark:text-gray-500 dark:text-gray-400", "dark:text-gray-500")
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"FIXED: {os.path.relpath(path, BASE)}")
        fixed += 1

print(f"\nTotal files fixed: {fixed}")
