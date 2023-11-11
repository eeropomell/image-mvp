import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext } from "react";
import { RoomContext } from "../App";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { NicknameContext } from "../App";


const socket = io("https://www.cotdamn.com:443");

export const Results = () => {
  const [results, setResults] = useState([]);
  const { room } = useContext(RoomContext);
  const { nickname_GLOBAL } = useContext(NicknameContext);
  const navigate = useNavigate();
  const [originalImg, setOriginalImg] = useState("");


  useEffect(() => {
    if (!room) {
      navigate("/");
    }
    socket.emit("room_req", { room });

    socket.on("room_res", (data) => {
   //   console.log("e", data);
      setResults(data.players);
      setOriginalImg(data.dir);
    });

    return () => {
      socket.off("results");
      socket.off("give");
    };
  }, []);


  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <h1 className="text-center">Original </h1>
          <Card className="mb-4">
            <Card.Header as="h2">Original</Card.Header>
            <Card.Body>
              <Image src={originalImg.url} fluid />
              <Card.Text>{originalImg.text}</Card.Text>
            </Card.Body>
          </Card>
          <h1 className="text-center">Results</h1>
          {results &&
            results.map((result, index) => (
              <Card key={index} className="mb-4">
                <Card.Header as="h2">{result.nickname}</Card.Header>
                <Card.Body>
                  <Image src={result.img} fluid />
                  <Card.Text>{result.text}</Card.Text>
                </Card.Body>
              </Card>
            ))}

          <Button
            onClick={() =>
              socket.emit("disconnect_", { room, nickname: nickname_GLOBAL }) && navigate("/")
            }
          >
            Lobby
          </Button>
  
        </Col>
      </Row>
    </Container>
  );
};

