import React, { useState, useEffect, useNavigate } from "react";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Error from "../Error/Error";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { fetchConfig } from "../../utils/fetchConfig";

export default function SongCard(props) {
  const [songs, setSongs] = useState([]);
  const [songID, setSongID] = useState("");
  const [songLyrics, setSongLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (props.data) {
      setSongs(props.data);
    }
  });

  const parseHtml = (html) => {
    var doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  async function onLyricsClick(songName, songArtist) {
    try {
      const backendURL = await fetchConfig();
      setLoading(true);
      setSongLyrics("");
      const songIdResponse = await fetch(
        `${backendURL}/genius/songID?name=${songName}&artist=${songArtist}`
      );
      const songIdData = await songIdResponse.json();
      const fetchedSongID = songIdData.songID;
      setSongID(fetchedSongID);

      if (fetchedSongID) {
        const lyricsResponse = await fetch(
          `${backendURL}/genius/lyrics?songID=${fetchedSongID}`
        );
        const lyricsData = await lyricsResponse.json();
        setSongLyrics(parseHtml(lyricsData.lyricData));
      }
    } catch (error) {
      console.error(error);
      setError(error)
    } finally {
      setLoading(false);
      handleShow();
    }
  }

  if (error) {
    return (
      <Error
        name="Network"
        type="500"
        description="Error occurred retrieving data. Please try again later."
      ></Error>
    );
  }
  return (
    <>
      {loading ? (
        <LoadingSpinner></LoadingSpinner>
      ) : (
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Lyrics</Modal.Title>
          </Modal.Header>

          <Modal.Body>{songLyrics}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {songs && songs.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ul>
            {songs.map((track, index) => (
              <Card key={index} style={{ width: "25rem", marginTop: "0.5rem" }}>
                <ListGroup variant="flush">
                  <ListGroup.Item style={{ display: "flex" }}>
                    <img
                      style={{ height: "50px", width: "50px" }}
                      src={track.album.images[0].url}
                      alt="new"
                    />
                    <p
                      style={{
                        justifyContent: "flex-end",
                        paddingLeft: "1rem",
                      }}
                    >
                      {track.name} by {track.artists[0].name}
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="primary"
                      onClick={() =>
                        onLyricsClick(track.name, track.artists[0].name)
                      }
                    >
                      View Lyrics
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            ))}
          </ul>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
