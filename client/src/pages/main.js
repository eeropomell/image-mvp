import io from "socket.io-client";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { RoomContext } from "../App";
import { NicknameContext } from "../App";
import {Card} from 'react-bootstrap'
import {Image} from 'react-bootstrap'
import { Figure } from "react-bootstrap";


const socket = io("https://www.cotdamn.com:443");

export const Main = () => {
  const [roomInput, setRoomInput] = useState("");
  const [roomExists, setRoomExists] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameExists, setNicknameExists] = useState(false);
  const [players, setPlayers] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [ready, setReady] = useState(false);
  const { room, setRoom } = useContext(RoomContext);
  const { setNickname_GLOBAL } = useContext(NicknameContext);

  const handleReady = () => {
    setReady(true);
    socket.emit("ready", { room: roomInput, nickname });
  };

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room_res", (res) => {
    //  console.log("E",res);
      setPlayers(res.players);
    });

    socket.on("game_starts", () => {
      navigate("/game");
    });

    return () => {
      socket.off("room_res");
      socket.off("game_starts");
    };
  }, []);

  const joinRoom = () => {
    socket.emit("room_exists", roomInput, (response) => {
      if (response.status === "success") {
    //    console.log(response.message);
        setRoomExists(true);
      } else {
     //   console.error(response.message);
        // handle error
      }
    });
  };

  const joinWithNickname = () => {
   // console.log(roomInput, nickname);
    socket.emit("join_room", { room: roomInput, nickname }, (response) => {
   //   console.log(roomInput, nickname, response);
      if (response.status === "success") {
    //    console.log(response.message);
        setInRoom(true);
        setRoom(roomInput);
        setNickname_GLOBAL(nickname);
        // handle success, navigate to the room or update the UI
      } else {
        console.error(response.message);
        // handle error, show an error message to the user
      }
    });
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <h1 className="text-center">Fun game</h1>
          <Form>
            <Form.Group controlId="room">
              <Form.Control
                type="text"
                placeholder="Join Room"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={joinRoom}>
              Join Room
            </Button>
            {roomExists && (
              <Form.Group controlId="nickname">
                <Form.Control
                  type="text"
                  placeholder="Enter nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <Button variant="primary" onClick={joinWithNickname}>
                  Join
                </Button>
                {nicknameExists && <p>Nickname already exists in the room.</p>}
              </Form.Group>
            )}
          </Form>
          {inRoom && (
            <>
              {!ready && (
                <Button variant="primary" onClick={handleReady}>
                  Ready
                </Button>
              )}
              <ListGroup>
                {players.map((player, index) => (
                  <ListGroup.Item key={index}>
                    {player.nickname} {player.ready ? "(Ready)" : ""}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Col>

      </Row>
      <Row className="justify-content-md-center mt-5">
    <Col xs lg="6">
      <Card>
        <Card.Body>
          <Card.Title>Guide and Rules</Card.Title>
          <ListGroup variant="flush">
            <ListGroup.Item>1. Rooms are numbered from 1 to 1000.</ListGroup.Item>
            <ListGroup.Item>2. When the game starts, all players get the same image and text description on their screen. Focus on the image, think about the modifications you'd like to make, then modify the text description accordingly. Your image will be created based on your description. At the end, the results are compared.</ListGroup.Item>
            <ListGroup.Item>3. If you get back the original image, it means that a content policy has blocked your text description. Avoid mentioning anything illegal or copyrighted, like "Star Wars".</ListGroup.Item>
            <ListGroup.Item>4. If you don't get any ideas for how to modify the image, scrolling through https://midlibrary.io/styles is a good way to get some inspiration</ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
      <Card className="mt-4">
  <Card.Body>
    <Card.Title>Example</Card.Title>
    <Card.Text>
      If the original image is:
    </Card.Text>
    <Figure>
      <Figure.Image
        width={500}
        height={500}
        src="https://media.discordapp.net/attachments/1023199844082397234/1171828256190763081/tubeImpressionism.png?ex=655e191b&is=654ba41b&hm=32ef2544189de7ea1cfcbe3e0beb7b31944598ea78ff2e468016b2cfe2cdaad6&=&width=633&height=633"
      />
      <Figure.Caption>
        London underground subway station, impressionistic, colorful, vibrant
      </Figure.Caption>
    </Figure>
    <Card.Text>
      Then if you like anime, and you think the subway would maybe look cool in an anime setting, traveling in heaven, you could modify it to "Anime-style illustration of a London underground train traveling over the clouds, heavenly, colorful, vibrant"
    </Card.Text>
    <Figure>
      <Figure.Image
        width={500}
        height={500}
        src="https://files.oaiusercontent.com/file-ytsFsO1W0K1C8ILyLGRnPZ8C?se=2023-11-11T10%3A21%3A47Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3D0f0087c7-d0d0-414f-a0f1-f6140bb4e2f4.webp&sig=R2rK1jpzHG9N4CVKLwsplYT2nsPtJLhlb0mdh2KwvBs%3D"
      />
      <Figure.Caption>
        Anime-style illustration of a London underground train traveling over the clouds, heavenly, colorful, vibrant
      </Figure.Caption>
    </Figure>
  </Card.Body>
</Card>
    </Col>
  </Row>
    </Container>
  );
};
