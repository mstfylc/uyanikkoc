"use client";

import { FormEvent, useState } from "react";

type CreatedAssignment = {
  id: string;
  title: string;
};

export function CreateAssignmentPanel() {
  const [title, setTitle] = useState("");
  const [created, setCreated] = useState<CreatedAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);
    setIsSubmitting(true);

    const response = await fetch("/api/coach/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ title }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Odev olusturulamadi.");
      return;
    }

    const data = (await response.json()) as { assignment: CreatedAssignment };
    setCreated(data.assignment);
    setTitle("");
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Baslik</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Matematik tekrar odevi"
          style={{ display: "block", width: "100%", margin: "0.5rem 0 1rem" }}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Odevi kaydet"}
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {created ? (
        <p data-testid="created-assignment">Olusturuldu: {created.title}</p>
      ) : null}
    </section>
  );
}
