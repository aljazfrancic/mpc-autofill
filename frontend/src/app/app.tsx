/**
 * This component represents the complete MPC Autofill project editor, ready to
 * drop into a page (as the only component). Must be wrapped with a Redux provider.
 */

import React, { useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import styled from "styled-components";

import { NavbarHeight, RibbonHeight } from "@/common/constants";
import { useAppSelector } from "@/common/types";
import { NoBackendDefault } from "@/components/noBackendDefault";
import { useBackendConfigured } from "@/features/backend/backendSlice";
import { SelectedImagesRibbon } from "@/features/bulkManagement/bulkManagementRibbon";
import { CardGrid } from "@/features/card/cardGrid";
import { CommonCardback } from "@/features/card/commonCardback";
import { Export } from "@/features/export/export";
import { FinishedMyProject } from "@/features/export/finishedMyProjectModal";
import { FinishSettings } from "@/features/finishSettings/finishSettings";
import { Import } from "@/features/import/import";
import {
  selectIsProjectEmpty,
  selectProjectCardback,
} from "@/features/project/projectSlice";
import { SearchSettings } from "@/features/searchSettings/searchSettings";
import { Status } from "@/features/status/status";

const FixedHeightRow = styled(Row)`
  height: ${RibbonHeight}px;
  box-shadow: 0 -1px 0 rgb(255, 255, 255, 50%) inset;
`;

const OverflowCol = styled(Col)`
  position: relative;
  // define height twice - first as a fallback for older browser compatibility,
  // then using dvh to account for the ios address bar
  height: calc(100vh - ${NavbarHeight}px - ${RibbonHeight}px);
  height: calc(100dvh - ${NavbarHeight}px - ${RibbonHeight}px);
  overflow-y: scroll;
  overscroll-behavior: none;
  scrollbar-width: thin;
`;

function App() {
  // TODO: should we periodically ping the backend to make sure it's still alive?
  //# region queries and hooks

  const backendConfigured = useBackendConfigured();
  const cardback = useAppSelector(selectProjectCardback);
  const isProjectEmpty = useAppSelector(selectIsProjectEmpty);

  //# endregion

  //# region effects

  /**
   * Ask the user for confirmation before they close the page if their project has any cards in it.
   */
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isProjectEmpty) {
        event.preventDefault();
        return false;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isProjectEmpty]);

  //# endregion

  return (
    <>
      {backendConfigured ? (
        <Row className="g-0">
          <FixedHeightRow className="g-0">
            <SelectedImagesRibbon />
          </FixedHeightRow>
          <OverflowCol lg={8} md={8} sm={6} xs={6} data-testid="left-panel">
            <CardGrid />
          </OverflowCol>
          <OverflowCol
            data-testid="right-panel"
            lg={4}
            md={4}
            sm={6}
            xs={6}
            style={{ zIndex: 1 }}
            className="px-2"
          >
            <Status />
            <Row className="g-0 pt-2">
              <FinishSettings />
            </Row>
            <Row className="g-0 pt-2">
              <SearchSettings />
            </Row>
            <Row className="g-0 pt-2">
              <Col lg={7} md={12} sm={12} xs={12}>
                <Import />
              </Col>
              <Col lg={5} md={12} sm={12} xs={12}>
                <Export />
              </Col>
              <FinishedMyProject />
            </Row>
            <Col className="g-0 pt-2" lg={{ span: 8, offset: 2 }} md={12}>
              <CommonCardback selectedImage={cardback} />
            </Col>
          </OverflowCol>
        </Row>
      ) : (
        <NoBackendDefault />
      )}
    </>
  );
}

export default App;
