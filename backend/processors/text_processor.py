import re
from collections import Counter


SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
WORD_RE = re.compile(r"[A-Za-z0-9']+")




def extract_keywords(text: str, top_k: int = 8):
    words = [w.lower() for w in WORD_RE.findall(text)]
    stop = set("""
       a an the and or but if then else for while to from of in on at by with is are was were be been being
       this that these those you your we they i he she it as not no yes do does did have has had can could would should
    """.split())
    tokens = [w for w in words if w not in stop and len(w) > 2]
    return [w for w, _ in Counter(tokens).most_common(top_k)]

def pseudo_entities(text: str):
# naive: sequences of Capitalized Words
    caps = re.findall(r"(?:\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", text)
    return list(dict.fromkeys(caps)) # dedupe, preserve order

def process_text(text: str):
   sentences = [s.strip() for s in SENTENCE_SPLIT.split(text) if s.strip()]
   words = WORD_RE.findall(text)
   return {
   "type": "text",
   "length": {
   "chars": len(text),
   "words": len(words),
   "sentences": len(sentences),
   },
   "keywords": extract_keywords(text),
   "entities_pseudo": pseudo_entities(text),
   "preview": text[:280]
   }