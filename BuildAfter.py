# -*- coding: utf-8 -*-
import sys

from bs4 import BeautifulSoup

root = sys.argv[1]
print(root)

file_path = "{}/index.html".format(root)
with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()
    soup = BeautifulSoup(html, "html.parser")

    js_code = soup.body.script.text
    soup.body.script["src"] = "./main.js"
    soup.body.script.string = ""

    js_output = "{}/main.js".format(root)
    with open(js_output, "w", encoding="utf-8") as js_file:
        js_file.write(js_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(soup.prettify())
