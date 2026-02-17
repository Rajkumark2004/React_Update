import re
import sys

def count_async(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    matches = re.findall(r'\basync\b', content)
    return len(matches)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("<filename>")
        sys.exit(1)

    filename = sys.argv[1]
    count = count_async(filename)
    print(f'"async" appears {count} times in {filename}')
