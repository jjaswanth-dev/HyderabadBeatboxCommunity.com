import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Wildcard from '@/models/Wildcard';
import { protect } from '@/lib/auth';

export async function GET() {
  await connectToDatabase();
  try {
    let wildcard = await Wildcard.findOne({});
    if (!wildcard) {
      // Return a default structure if none exists in the DB yet,
      // but do not save it to DB yet.
      wildcard = {
        isActive: false,
        title: 'HYDERABAD BEATBOX CHAMPIONSHIP 2026 ALL INDIA CATEGORY',
        description: `# HYDERABAD BEATBOX CHAMPIONSHIP 2026 ALL INDIA CATEGORY
## ALL INDIA SOLO WILDCARD GUIDELINES

---

## Wildcard Submission Window

**Deadline:** 10 August 2026 | 12:00 AM (IST)

Late submissions will not be accepted.

---

## Eligibility

The **All India Solo Wildcard** is open to beatboxers from across India.

---

## Video Requirements

**Platform:** Upload your wildcard to **YouTube** (Public or Unlisted).

**Hashtag:** Include **#HBC2026** in the video description.

**Video Title Format:**

**ARTIST NAME | HYDERABAD BEATBOX CHAMPIONSHIP 2026 | ALL INDIA SOLO WILDCARD | #HBC2026**

### Video Guidelines
- Record in **Landscape (16:9)**.
- Ensure your face and mouth remain clearly visible throughout the performance.
- Use good lighting and a stable camera.
- Record in a quiet environment for the best audio quality.

---

## Performance Duration

**Introduction:** Up to **15 seconds**

Introduce yourself by saying:

> **"My name is [Artist Name], and this is my All India Solo Wildcard for the Hyderabad Beatbox Championship 2026."**

**Beatbox Routine:** Approximately **1 minute 30 seconds**

**Total Duration:** Approximately **1 minute 45 seconds**

---

## Recording Rules

- The performance must be recorded in **one continuous take**.
- **No cuts** are allowed.
- Audio and video must be recorded simultaneously.
- The performer must remain clearly visible throughout the performance.
- Any submission found to contain manipulated or misleading content may be disqualified.

---

## Audio & Mixing Rules

To ensure fair judging while maintaining good recording quality, the following processing is permitted.

### Allowed
- Basic EQ
- Basic Compression
- Reverb
- Moderate Noise Reduction

### Not Allowed
- Delay
- Auto-Tune / Pitch Correction
- Overdubbing or adding new sounds after the recording.
- Re-recording or replacing any part of the original performance.
- Applying different processing to individual sounds (kick, snare, bass, etc.).
- Automation or changing effects during the performance.

The entire recording must use the same processing from start to finish.

---

## Raw Recording Submission

Participants using an **external microphone or audio interface** must submit:
- Original camera recording.
- Original microphone recording (raw).

Participants recording directly using a **phone or camera** without any external audio equipment only need to submit their YouTube link.

The organizing team may request additional raw files for verification if required.

---

## Judging Criteria (50 Points)

### Technical Skill (10 Points)
Difficulty, cleanliness, control, and consistency of your beatboxing.

### Musicality (10 Points)
Rhythm, timing, groove, and how musical your routine sounds.

### Structure & Composition (10 Points)
Flow, transitions, arrangement, and the overall development of your routine.

### Originality (10 Points)
Creativity, unique sounds, patterns, and your personal style.

### Subjectivity (10 Points)
The overall impact of your performance, including confidence, expression, stage presence, and the impression you leave on the judges.

---

## Qualification

The **Top 25 Solo Wildcards** will qualify for the **Hyderabad Beatbox Championship 2026**.

The judges' decision will be final.

---

## Disqualification

Entries may be disqualified if:
- Submitted after the deadline.
- Video or audio violates the competition rules.
- Incorrect title format or missing **#HBC2026**.
- Required raw recordings are not submitted when requested.
- False or misleading information is provided.

---

## Registration Fee

**₹350**

---

## Submission

Submit your wildcard through:

**www.hyderabadbeatboxcommunity.in**

---

## Submission Checklist

☑ Upload your wildcard to YouTube.

☑ Use the correct video title format.

☑ Add **#HBC2026** in the description.

☑ Submit your YouTube link.

☑ Submit raw recordings (if required).

☑ Complete your registration.

---

## Important Note

By submitting your wildcard, you confirm that:
- The performance is your own original work.
- You have read and agreed to all the rules and guidelines.
- Hyderabad Beatbox Community reserves the right to use your wildcard for judging, promotion, livestreams, social media, and other event-related purposes. Ownership of the performance remains with the artist.

We wish every participant the very best.

# See you at the Hyderabad Beatbox Championship 2026! 🎤🔥`,
        poster: '',
        googleFormUrl: 'https://docs.google.com/forms/',
      };
    }
    return NextResponse.json(wildcard, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const body = await req.json();

    let wildcard = await Wildcard.findOne({});
    if (wildcard) {
      wildcard.isActive = body.isActive;
      wildcard.title = body.title;
      wildcard.description = body.description;
      wildcard.poster = body.poster;
      wildcard.googleFormUrl = body.googleFormUrl;
      await wildcard.save();
    } else {
      wildcard = await Wildcard.create(body);
    }

    return NextResponse.json(wildcard, { status: 200 });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
