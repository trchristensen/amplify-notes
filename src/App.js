import React, { useState, useEffect } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import aws_exports from "./aws-exports";
import {
  AmplifyAuthenticator,
  withAuthenticator,
  AmplifySignOut,
  AmplifySignIn,
  AmplifySignUp,
} from "@aws-amplify/ui-react";
import "./App.css";

import { listNotes } from "./graphql/queries";
import { createNote, updateNote, deleteNote } from "./graphql/mutations";

Amplify.configure(aws_exports);

const App = () => {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState("");
  const [noteIndex, setNoteIndex] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    handleListNotes();
  }, []);

  const handleListNotes = async () => {
    const { data } = await API.graphql(graphqlOperation(listNotes));
    setNotes(data.listNotes.items);
    console.log(data);
  };

  const hasExistingNote = () => {
    if (noteId) {
      const isNote = notes.findIndex((note) => note.id === noteId) > -1;
      return isNote;
    }
    return false;
  };

  const hasNote = () => {
    if (note.trim()) {
      return true;
    }
    return false;
  };

  const handleUpdateNote = async () => {
    const payload = { id: noteId, note };
    const { data } = await API.graphql(
      graphqlOperation(updateNote, { input: payload })
    );
    const updatedNote = data.updateNote;
    const updatedNotes = [
      ...notes.slice(0, noteIndex),
      updatedNote,
      ...notes.slice(noteIndex + 1),
    ];
    setNotes(updatedNotes);
    setNote("");
    setNoteId("");
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const payload = { id };
    const { data } = await API.graphql(
      graphqlOperation(deleteNote, { input: payload })
    );
    const deletedNoteId = data.deleteNote.id;
    const deletedNoteIndex = notes.findIndex(
      (note) => note.id === deletedNoteId
    );
    const updatedNotes = [
      ...notes.slice(0, deletedNoteIndex),
      ...notes.slice(deletedNoteIndex, +1),
    ];
    setDeletingId("");
    setNotes(updatedNotes);
  };

  const handleAddNote = async (event) => {
    event.preventDefault();

    if (hasExistingNote()) {
      handleUpdateNote();
    } else if (hasNote()) {
      const payload = { note };
      const { data } = await API.graphql(
        graphqlOperation(createNote, { input: payload })
      );
      const newNote = data.createNote;
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setNote("");
    }
  };

  const handleSetNote = ({ note, id }, index) => {
    setNote(note);
    setNoteId(id);
    setNoteIndex(index);
  };

  return (
    <AmplifyAuthenticator>
      <AmplifySignIn headerText="My Custom Sign In Header" slot="sign-in" />
      <AmplifySignUp headerText="My Customer Sign Up Header" slot="sign-up" />
     
      <AmplifySignOut />
   
      <div className="flex flex-column items-center justify-center bg-washed-red pa3">
        <h1 className="code f2">Amplify Notetaker</h1>
        <form className="mb3" onSubmit={handleAddNote}>
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note.."
            value={note}
            onChange={({ target }) => setNote(target.value)}
          />
          <button className="pa2 f4" type="submit">
            {noteId ? "Update" : "Add"}
          </button>
        </form>
        <div>
          {notes.map((item, i) => (
            <div key={item.id} className="flex items-center">
              <li
                style={{ color: deletingId === item.id && "red" }}
                onClick={() => handleSetNote(item, i)}
                className="list pa1 f3"
              >
                {item.note}
              </li>
              <button onClick={() => handleDelete(item.id)} className="bg-transparent bn f4">&times;</button>
            </div>
          ))}
        </div>
      </div>
    </AmplifyAuthenticator>
  );
};

export default withAuthenticator(App);
