"""Fix dark mode for remaining 18 files."""
import os, re

BASE = r"c:\Users\D\Desktop\bookhushly"

def safe_replace(content, old, new, check="dark:bg-"):
    """Replace old with new, skip if dark: variant already nearby."""
    result = []
    start = 0
    while True:
        idx = content.find(old, start)
        if idx == -1:
            result.append(content[start:])
            break
        # Check if dark: variant already present nearby
        window = content[max(0, idx-10):idx+len(old)+150]
        if check in window and check in new:
            # Already has a dark: variant here, skip
            result.append(content[start:idx+len(old)])
            start = idx + len(old)
            continue
        result.append(content[start:idx])
        result.append(new)
        start = idx + len(old)
    return "".join(result)


def fix_loading(content):
    """Fix loading skeleton files."""
    # bg-white cards
    content = safe_replace(content,
        'className="bg-white rounded-2xl p-',
        'className="bg-white dark:bg-gray-900 rounded-2xl p-')
    content = safe_replace(content,
        'className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"',
        'className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"')
    content = safe_replace(content,
        'className="bg-white rounded-2xl shadow-sm border border-gray-100 p-',
        'className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-')
    # wrapper bg
    content = safe_replace(content,
        'className="min-h-screen bg-gray-50 p-6"',
        'className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6"',
        check="dark:bg-gray-950")
    # table header bg
    content = safe_replace(content,
        'className="flex gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50"',
        'className="flex gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"')
    # skeleton pulse items
    content = content.replace(
        'className="h-3 bg-gray-200 rounded animate-pulse',
        'className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-7 bg-gray-200 rounded animate-pulse',
        'className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"',
        'className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"')
    content = content.replace(
        'className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"',
        'className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"')
    content = content.replace(
        'className="h-9 bg-gray-200 rounded animate-pulse',
        'className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-8 bg-gray-200 rounded animate-pulse',
        'className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-4 bg-gray-200 rounded animate-pulse',
        'className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-5 bg-gray-200 rounded animate-pulse',
        'className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse')
    content = content.replace(
        'className="h-8 w-8 rounded-full bg-gray-200 animate-pulse',
        'className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse')
    content = content.replace(
        'className="h-10 w-10 rounded-full bg-gray-200 animate-pulse',
        'className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse')
    content = content.replace(
        'className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse',
        'className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse')
    content = content.replace(
        'className="h-7 w-16 bg-gray-200 rounded-lg animate-pulse"',
        'className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"')
    content = content.replace(
        'className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"',
        'className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"')
    content = content.replace(
        'className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"',
        'className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"')
    content = content.replace(
        'className="h-40 bg-gray-100 rounded-xl animate-pulse"',
        'className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"')
    content = content.replace(
        'className="p-4 border-b border-gray-100"',
        'className="p-4 border-b border-gray-100 dark:border-gray-800"')
    content = content.replace(
        'border-b border-gray-50 last:border-0"',
        'border-b border-gray-50 dark:border-gray-800 last:border-0"')
    return content


def fix_common(content):
    """Common dark mode fixes for all files."""
    # bg-white in cards/containers → dark:bg-gray-900
    replacements = [
        ('bg-white rounded-2xl border border-gray-100"',
         'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"'),
        ('bg-white rounded-2xl border border-gray-100 dark:border-gray-800 p-5',
         'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5'),
        ('bg-gray-50 rounded-xl"',
         'bg-gray-50 dark:bg-gray-900 rounded-xl"'),
        ('bg-gray-50 rounded-xl ',
         'bg-gray-50 dark:bg-gray-900 rounded-xl '),
        ('bg-gray-100 rounded-lg overflow-hidden"',
         'bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"'),
        ('border-t"',
         'border-t dark:border-gray-700"'),
        ('border-t border-gray-200"',
         'border-t border-gray-200 dark:border-gray-700"'),
        ('border-t border-gray-200 ',
         'border-t border-gray-200 dark:border-gray-700 '),
        ('bg-gray-50 dark:bg-gray-900 p-4',
         'bg-gray-50 dark:bg-gray-900 p-4'),
    ]
    for old, new in replacements:
        if old != new:
            content = safe_replace(content, old, new)
    return content


LOADING_FILES = [
    r"app\(admin)\admin\loading.jsx",
    r"app\(dashboard)\loading.jsx",
    r"app\(vendor)\vendor\dashboard\loading.jsx",
]

COMMON_FIX_FILES = [
    r"app\(admin)\admin\dashboard\profile\page.jsx",
    r"components\shared\dashboard\vendor\analytics.jsx",
    r"components\shared\dashboard\vendor\apartments\details\edit\photos.jsx",
    r"components\shared\dashboard\vendor\apartments\step5.jsx",
    r"components\shared\dashboard\vendor\apartments\step6.jsx",
    r"components\shared\dashboard\vendor\hotels\create\create.jsx",
    r"components\shared\dashboard\vendor\hotels\create\restore-draft.jsx",
    r"components\shared\dashboard\vendor\hotels\create\step1.jsx",
    r"components\shared\dashboard\vendor\hotels\details\details.jsx",
    r"components\shared\dashboard\vendor\hotels\details\pricing.jsx",
    r"components\shared\dashboard\vendor\hotels\details\room-types.jsx",
    r"components\shared\dashboard\vendor\hotels\details\rooms.jsx",
    r"app\(vendor)\vendor\dashboard\hotels\[id]\page.jsx",
    r"app\(vendor)\vendor\dashboard\serviced-apartments\new\page.jsx",
    r"components\shared\dashboard\admin\SupportStaffPanel.jsx",
]

fixed = 0
for rel in LOADING_FILES:
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        print(f"NOT FOUND: {rel}")
        continue
    with open(path, encoding="utf-8") as f:
        original = f.read()
    updated = fix_loading(original)
    if updated != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"FIXED (loading): {rel}")
        fixed += 1
    else:
        print(f"NO CHANGE: {rel}")

for rel in COMMON_FIX_FILES:
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        print(f"NOT FOUND: {rel}")
        continue
    with open(path, encoding="utf-8") as f:
        original = f.read()
    updated = fix_common(original)
    if updated != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"FIXED: {rel}")
        fixed += 1
    else:
        print(f"NO CHANGE: {rel}")

print(f"\nTotal fixed: {fixed}")
