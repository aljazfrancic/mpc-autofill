import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import React, { useEffect, useState } from "react";
import { processLines } from "../../common/processing";
import { addImages } from "../project/projectSlice";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { DFCPairs } from "../../common/types";
import {
  FaceSeparator,
  Card,
  Cardback,
  Token,
  ReversedCardTypePrefixes,
} from "../../common/constants";
import { APIGetPlaceholderText } from "../../app/api";

interface ImportTextProps {
  dfcPairs: DFCPairs;
}

export function ImportText(props: ImportTextProps) {
  // TODO: add an accordion here for explaining how to search for each different card type with prefixes
  const dispatch = useDispatch<AppDispatch>();
  const [showTextModal, setShowTextModal] = useState(false);
  const handleCloseTextModal = () => setShowTextModal(false);
  const handleShowTextModal = () => setShowTextModal(true);
  const [textModalValue, setTextModalValue] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");

  const formatPlaceholderText = (placeholders: {
    [cardType: string]: Array<[number, string]>;
  }): string => {
    // TODO: check compatibility of `\n` in different browsers. `separator` was previously "&#10;".

    const separator = "\n";
    const placeholderTextByCardType: Array<string> = [];

    for (const cardType of [Card, Token, Cardback]) {
      if (placeholders[cardType] != null) {
        placeholderTextByCardType.push(
          placeholders[cardType]
            .map(
              (x: [number, string]) =>
                `${x[0]}x ${ReversedCardTypePrefixes[cardType]}${x[1]}`
            )
            .join(separator)
        );
      }
    }
    return placeholderTextByCardType.join(separator + separator);
  };

  useEffect(() => {
    APIGetPlaceholderText().then((placeholders) =>
      setPlaceholderText(formatPlaceholderText(placeholders))
    );
  }, []);

  const handleSubmitTextModal = () => {
    /**
     * Parse the contents of the modal and add the resultant queries in the desired numbers of instances to the project.
     */

    const processedLines = processLines(textModalValue, props.dfcPairs);
    dispatch(addImages({ lines: processedLines }));
    handleCloseTextModal();
  };

  return (
    <>
      <Dropdown.Item onClick={handleShowTextModal}>
        <i className="bi bi-card-text" style={{ paddingRight: 0.5 + "em" }} />{" "}
        Text
      </Dropdown.Item>
      <Modal
        show={showTextModal}
        onHide={handleCloseTextModal}
        onExited={() => setTextModalValue("")}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Cards — Text</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Type the names of the cards you'd like to add to your order and hit{" "}
            <b>Submit</b>. One card per line.
          </p>
          <p>
            Specify both front and back queries by separating them with{" "}
            <code>{FaceSeparator}</code> — for example,{" "}
            <code>4x goblin {FaceSeparator} t:elf</code>.
          </p>
          <p>
            If you don't specify a back query and your front query is a
            double-faced card, we will automatically query the back for you.
          </p>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={12}
              placeholder={placeholderText}
              required={true}
              onChange={(event) => setTextModalValue(event.target.value)}
              value={textModalValue}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTextModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitTextModal}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
