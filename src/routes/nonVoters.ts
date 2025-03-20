import { db } from "../lib/firebase.ts"; // Firestore-Instanz aus firebase.ts importieren
import { collection, getDocs } from "firebase/firestore";

export async function getEmailsWithoutSecondVote(): Promise<string[]> {
  const votesRef = collection(db, "votes");
  const snapshot = await getDocs(votesRef);

  const emailsWithoutSecondVote: string[] = [];

  snapshot.forEach((doc) => {
    if (!("secondVote" in doc.data())) {
      emailsWithoutSecondVote.push(doc.id); // Die E-Mail ist der Dokumentname
    }
  });

  console.log("E-Mails ohne secondVote:", emailsWithoutSecondVote);
  return emailsWithoutSecondVote;
}

getEmailsWithoutSecondVote()