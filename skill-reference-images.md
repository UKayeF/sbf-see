# Reference Images Skill

This skill adds image references to quiz questions based on image file naming conventions.

## Image Naming Conventions

- **Question images**: `{question_number}.png` (e.g., `4.png`, `16.png`)
- **Multi-question images**: `{question_number}-{suffix}.png` (e.g., `4-1.png`, `4-2.png`)
- **Answer images**: `{question_number}-{letter}.png` (e.g., `120-a.png` for answer a, `120-b.png` for answer b)
- **Multi-answer images**: `{question_number}-{letter}-{suffix}.png` (e.g., `120-a-1.png`, `120-a-2.png`)

## Usage

### Prerequisites

1. Questions in fragen.json must have a `number` field at each question entry
2. Images must be located in `src/public/images/`

### Script to Add Images

```javascript
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/fragen.json', 'utf8'));
const imagesDir = 'src/public/images';
const imageFiles = fs.readdirSync(imagesDir);

function getImages(questionNumber, hasAnswers = false) {
  const images = [];

  if (!hasAnswers) {
    for (const file of imageFiles) {
      const match = file.match(/^(\d+)(-[a-d])?(-\d+)?\.png$/);
      if (match && parseInt(match[1]) === questionNumber) {
        images.push(file);
      }
    }
    images.sort((a, b) => {
      const aMatch = a.match(/^(\d+)(-[a-d])?(-\d+)?\.png$/);
      const bMatch = b.match(/^(\d+)(-[a-d])?(-\d+)?\.png$/);
      const aSuffix = aMatch[3] ? parseInt(aMatch[3]) : 0;
      const bSuffix = bMatch[3] ? parseInt(bMatch[3]) : 0;
      return aSuffix - bSuffix;
    });
  } else {
    for (const file of imageFiles) {
      const match = file.match(/^(\d+)-([a-d])(-\d+)?\.png$/);
      if (match && parseInt(match[1]) === questionNumber) {
        images.push({ file, letter: match[2] });
      }
    }
    images.sort((a, b) => a.file.localeCompare(b.file));
  }

  return images;
}

function prefixImages(arr) {
  if (!Array.isArray(arr)) return;
  for (const item of arr) {
    if (item.image && item.image.length > 0) {
      item.image = item.image.map(img => 'images/' + img);
    }
    if (item.images && item.images.length > 0) {
      item.images = item.images.map(img => 'images/' + img);
    }
    for (const ans of item.answers || []) {
      if (ans.images && ans.images.length > 0) {
        ans.images = ans.images.map(img => 'images/' + img);
      }
    }
  }
}

for (const category of Object.keys(data.categories)) {
  for (const q of data.categories[category]) {
    const questionImages = getImages(q.number);
    if (questionImages.length > 0) {
      q.images = questionImages;
    }

    const answerImages = getImages(q.number, true);
    if (answerImages.length > 0) {
      const letterIndex = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      for (const img of answerImages) {
        const idx = letterIndex[img.letter];
        if (idx !== undefined && q.answers[idx]) {
          if (!q.answers[idx].images) q.answers[idx].images = [];
          q.answers[idx].images.push(img.file);
        }
      }
    }
  }
}

prefixImages(Object.values(data.categories).flat());
fs.writeFileSync('src/data/fragen.json', JSON.stringify(data, null, 2));
console.log('Done!');
```

## Expected Output Structure

```json
{
  "number": 4,
  "question": "Wie lang ist die Dauer eines kurzen Tons?",
  "answers": [
    { "text": "Etwa 1 Sekunde.", "isCorrect": true },
    { "text": "Etwa 2 Sekunden.", "isCorrect": false },
    { "text": "Weniger als 1 Sekunde.", "isCorrect": false },
    { "text": "Weniger als 4 Sekunden.", "isCorrect": false }
  ],
  "images": ["images/4-1.png", "images/4-2.png"],
  "image": []
}
```

With answer-specific images:

```json
{
  "number": 120,
  "question": "What signal must a sailboat give?",
  "answers": [
    { "text": "Long, short, short", "isCorrect": true, "images": ["images/120-a.png"] },
    { "text": "Long, long, short", "isCorrect": false, "images": ["images/120-b.png"] },
    { "text": "Kräftiges Schallsignal", "isCorrect": false },
    { "text": "Kurz, lang, kurz", "isCorrect": false, "images": ["images/120-d.png"] }
  ],
  "images": ["images/120-a.png", "images/120-b.png", "images/120-d.png"],
  "image": []
}
```

## Notes

- Questions without images will have empty `images` array
- Answer-specific images are attached to the answer with matching letter (a-d)
- When running this skill, first ensure questions have sequential `number` fields (1, 2, 3, ...)