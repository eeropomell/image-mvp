import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { NicknameContext } from "../App";
import { useContext } from "react";
import { Container, Row, Col, Image, Form, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Figure} from 'react-bootstrap'
import {RoomContext} from "../App"

const socket = io("https://www.cotdamn.com:443");

export const Game = (props) => {
  const [imageData, setImageData] = useState(null);
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { nickname_GLOBAL } = useContext(NicknameContext);
  const [opacity,setOpacity] = useState(1);
  const {room} = useContext(RoomContext)
  const nickname = nickname_GLOBAL

  useEffect(() => {
    if (!room) {
        navigate("/");
    } else {
        socket.emit("image_req", {room});
    }

    socket.on("image_res", (data) => {
      console.log("d",data)
      setImageData(data);
      setText(data.text);
    });

    socket.on("generation_recv", (data) => {
      console.log(data)
      setImageData((old) => ({text: old?.text, imageUrl: data}))
      console.log("w false")
      setWaiting(false);
    });

    socket.on("done", () => {
        console.log("done")
      setDone(true);
    });

    return () => {
      socket.off("image_res");
      socket.off("image_req")
      socket.off("generation_recv");
      socket.off("done");
    };
  }, []);

  const handleReady = () => {
    if (waiting){
        return
    }
    if (done) {
      navigate("/results");
    } else {
      setWaiting(true);
      console.log("w true")
      console.log("nickname", nickname)
      socket.emit("generation_send", { text, nickname, room});
    }
  };

  return (
    <Container>
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <h1 className="text-center">Game</h1>
        {imageData && 
          <Figure>
            <Figure.Image
              width={500}
              height={500}
              alt="Game"
              src={imageData.imageUrl}
              style={{opacity: opacity}} // Apply the opacity
            />
            <textarea 
    style={{width: '100%'}}
    onBlur={e => setText(e.target.value)}
  >
    {text}
  </textarea>
            
          </Figure>
        }
  <div className="d-flex justify-content-center mt-3">
    <Button variant="primary" onClick={handleReady}>
        {!waiting && done ? "All results" : "Ready"}
    </Button>
</div>
        {waiting && 
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Spinner animation="border" variant="primary" />
          <span>Creating...</span>
        </div>}
      </Col>
    </Row>
  </Container>
  );
};
