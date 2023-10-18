import { useState } from "react";
import { Button, Card, Form, Stack, Modal } from "react-bootstrap";
import locationIcon from "../assets/location.svg";
import calendarIcon from "../assets/calendar.svg";
import editIcon from "../assets/edit.svg";
import { IShift } from "../api/shiftApi";
import { Link } from "react-router-dom";
import AttendanceListModal from "./attendanceList";

import AddShiftForm from "./addShiftForm";

const latoFont = {
    fontFamily: "Lato",
    fontStyle: "normal",
};

const titleTextStyle = {
    fontSize: "25px",
    fontWeight: "600",
    lineHeight: "30px",
    ...latoFont,
};

const commonTextStyle = {
    fontSize: "20px",
    fontWeight: "500",
    lineHeight: "24px",
    ...latoFont,
};

const buttonTextStyle = {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "19px",
    color: "#FFFDFD",
    ...latoFont,
};

type ShiftCardProps = {
    shiftData: IShift;
    isAdmin: boolean | undefined;
    handleSelected: (id: string, checkStatus: boolean) => void;
};

export default function ShiftCard({ shiftData, isAdmin, handleSelected }: ShiftCardProps) {
    const { name, startAt, address, _id } = shiftData;
    const [showEditModal, setShowEditModal] = useState(false);

    const dateString = new Date(startAt).toLocaleString();

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    return (
        <>
            <Card
                style={{
                    width: "25rem",
                    padding: "0.5rem",
                    borderRadius: "1rem",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    margin: "15px",
                }}
            >
                <Card.Body>
                    <Stack direction="horizontal" style={{ justifyContent: "space-between" }}>
                        <Card.Title style={titleTextStyle}>{name}</Card.Title>
                        <Stack direction="horizontal">
                            {isAdmin && <AttendanceListModal shift={shiftData || {}} />}
                            {isAdmin && (
                                <>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowEditModal(true);
                                        }}
                                        size="sm"
                                        variant="light"
                                        style={{ borderRadius: "50%", margin: "10px" }}
                                    >
                                        <img src={editIcon} alt="edit shift icon" />
                                    </Button>
                                    <Form.Check
                                        style={{
                                            top: ".8rem",
                                            scale: "1.4",
                                        }}
                                        onChange={(e) => {
                                            handleSelected(_id, e.target.checked);
                                        }}
                                        aria-label="Shift selection checkbox"
                                    />
                                </>
                            )}
                        </Stack>
                    </Stack>
                    <Card.Text as="h6" style={{ color: "#4D41D8", ...commonTextStyle }}>
                        <img style={{ margin: "0 10px 0 0" }} src={locationIcon} alt="location icon" />
                        {address}
                    </Card.Text>
                    <hr />
                    <Stack direction="horizontal" style={{ justifyContent: "space-between" }}>
                        <Card.Text as="h6" style={commonTextStyle}>
                            <img style={{ margin: "0 5px 0 0" }} src={calendarIcon} alt="date icon" />
                            {dateString}
                        </Card.Text>
                        <Link to={`/shift/${shiftData._id}`}>
                            <Button style={{ borderRadius: "4rem", padding: "0.5rem 1.5rem", ...buttonTextStyle }}>
                                {"View"}
                            </Button>{" "}
                        </Link>
                    </Stack>
                </Card.Body>
            </Card>
            <Modal show={showEditModal}>
                <AddShiftForm previousShiftFields={shiftData} handleClose={handleCloseModal} />
            </Modal>
        </>
    );
}
