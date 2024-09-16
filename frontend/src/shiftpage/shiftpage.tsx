/* eslint-disable @typescript-eslint/no-misused-promises */

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./shiftpage.css";
import { NavigationBar } from "../components/navbar";
import { WEITBackground } from "../components/background";
import ModalBody from "react-bootstrap/ModalBody";
import ShiftCard from "../components/shiftCard";
import { useSearchShifts } from "../hooks/useSearchShifts";
import { useOwnUser } from "../hooks/useOwnUser";
import { useMyShifts } from "../hooks/useMyShifts";
import AddShiftForm from "../components/addShiftForm";
import addShiftIcon from "../assets/addShiftIcon.svg";
import deleteIcon from "../assets/deleteIcon.svg";
import filterIcon from "../assets/filterIcon.svg";
import Modal from "react-bootstrap/Modal";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/loadingSpinner";
import { deleteShift, updateShift } from "../api/shiftApi";
import { ResponseWithStatus } from "../api/utility";
import { FilterResultsModal } from "../components/filterResultsModal/filterResultsModal";
import { Filters } from "../components/filterResultsModal/types";
import { getDefaultFilters } from "../components/filterResultsModal/util";
import { useVoltypesForUser } from "../hooks/useVolTypesForUser";
import { useAllVolTypes } from "../hooks/useAllVolTypes";
import { ExportModal } from "../components/exportModal/exportModal";
import { Button } from "react-bootstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import MapView from "./mapView";

type ShiftPageProps = {
    shiftType: string;
};

const ShiftPage = ({ shiftType }: ShiftPageProps) => {
    const { data: userData } = useOwnUser();
    const { isLoading: loadingAllVolTypes, data: allVolTypes } = useAllVolTypes();
    const { data: userVolTypesData, isLoading: loadingUserVolTypes } = useVoltypesForUser(userData?.data?._id);

    const getFilterInSessionStorage = (): Filters => {
        const sessionFiltersString: string | null = sessionStorage.getItem("shiftResultFilters");
        if (!sessionFiltersString) {
            console.log("Default");
            return getDefaultFilters(userVolTypesData?.data || []);
        }
        const sessionFilters = JSON.parse(sessionFiltersString) as Filters;
        const something = {
            from: new Date(sessionFilters.from),
            to: new Date(sessionFilters.to),
            volTypes: sessionFilters.volTypes,
            category: sessionFilters.category,
            hours: sessionFilters.hours,
            hideUnavailable: sessionFilters.hideUnavailable,
            location: sessionFilters.location,
        };
        return something;
    };

    const [resultFilters, setResultFilters] = useState<Filters | undefined>(
        loadingUserVolTypes ? undefined : getDefaultFilters(userVolTypesData?.data || [])
    );

    //Saves most recent filter into the session storage
    const updateFiltersInSessionStorage = (filters: Filters) => {
        sessionStorage.setItem("shiftResultFilters", JSON.stringify(filters));
    };

    const {
        isLoading = true,
        isError,
        data,
        error,
        refetch: refetchShifts,
    } = shiftType === "searchShifts" ? useSearchShifts(resultFilters) : useMyShifts(userData?.data?._id);

    const [show, setShow] = useState<boolean>(false);
    const [filterPanelVisible, setFilterPanelVisible] = useState<boolean>(false);
    const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
    const [isDeleteLoading, setisDeleteLoading] = useState<boolean>(false);
    const [selectedShifts, setselectedShifts] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    // const [show2, setShow2] = useState<boolean>(false);
    // const [shiftdata, setshiftData] = useState("");
    const localizer = momentLocalizer(moment);
    const [currentView, setCurrentView] = useState("card");
    const [showUnreleased, setShowUnreleased] = useState(false);
    const [isPublishButtonEnabled, setIsPublishButtonEnabled] = useState(false);

    const toggleUnreleasedShifts = () => {
        setShowUnreleased(!showUnreleased);
        if (!showUnreleased) {
            setIsPublishButtonEnabled(false);
        }
        setselectedShifts([]);
    };

    //Apply filter from previous session if user exists
    useEffect(() => {
        if (userVolTypesData) {
            // setResultFilters(getDefaultFilters(userVolTypesData?.data || []));
            setResultFilters(getFilterInSessionStorage());
        }
    }, [userVolTypesData]);

    //Runs everytime number of selected shift changes
    useEffect(() => {
        setShowDeleteButton(isShiftSelected());
    }, [selectedShifts]);

    //Enable the publish button if page is on Unreleased mode and at least one shift has been selected
    useEffect(() => {
        if (showUnreleased && isShiftSelected()) {
            setIsPublishButtonEnabled(true);
        } else {
            setIsPublishButtonEnabled(false);
        }
    }, [selectedShifts]);

    // const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     setCurrentView(event.target.value);
    // };

    const handleSelected = (id: string, checkStatus: boolean) => {
        setselectedShifts((prevSelectedShifts) => {
            if (checkStatus) {
                //setIsPublishButtonEnabled(true); // Enable the "Publish" button when a shift is selected
                return [...prevSelectedShifts, id];
            } else if (!checkStatus) {
                const updatedSelectedShifts = prevSelectedShifts.filter((shiftId) => shiftId !== id);
                //setIsPublishButtonEnabled(updatedSelectedShifts.length > 0); // Enable if there are selected shifts
                return updatedSelectedShifts;
            } else {
                return prevSelectedShifts;
            }
        });
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const openAddShift = () => {
        setShow(true);
    };

    const closeAddShift = () => {
        setShow(false);
    };

    const deleteSelected = async () => {
        setisDeleteLoading(true);
        try {
            let deleteActions: Array<Promise<ResponseWithStatus>> = [];
            selectedShifts.forEach((shiftId) => {
                const deletePromise = deleteShift({ _id: shiftId });
                deleteActions = [...deleteActions, deletePromise];
            });
            await Promise.all(deleteActions);
        } catch (error) {
            console.log("error deleting shifts", error);
        }
        await refetchShifts();
        setisDeleteLoading(false);
        setselectedShifts([]);
    };
    //Enable button if any shift is selected
    const isShiftSelected = () => {
        if (selectedShifts.length > 0) {
            return true;
        }
        return false;
    };

    // Upon clicking Filter button, resets the selectedshifts list
    // Shows filter panel
    const handleFilterPanel = () => {
        setFilterPanelVisible(true);
        setselectedShifts([]);
    };

    interface ShiftEvent {
        id: string;
    }
    //redirect to shift page upon clicking shift on calendar
    const handleSelectEvent = (event: ShiftEvent) => {
        window.location.replace(`/shift/${event.id}`);
    };
    const handlePublish = async () => {
        if (!isPublishButtonEnabled) {
            return; // Do nothing if the "Publish" button is not enabled
        }

        try {
            for (const shiftId of selectedShifts) {
                await updateShift({ isUnreleased: false }, shiftId);
            }

            setselectedShifts([]);
            setIsPublishButtonEnabled(false); // Disable the "Publish" button after publishing

            // Reload the page
            window.location.reload();
        } catch (error) {
            console.error("Error publishing shifts", error);
        }
    };

    return (
        <>
            <NavigationBar />
            <WEITBackground>
                <ModalBody>
                    <div className="main-container">
                        <div className="tab-container">
                            <div
                                className={currentView === "card" ? "tab active" : "tab"}
                                onClick={() => setCurrentView("card")}
                            >
                                Card View
                            </div>
                            <div
                                className={currentView === "calendar" ? "tab active" : "tab"}
                                onClick={() => setCurrentView("calendar")}
                            >
                                Calendar View
                            </div>
                            <div
                                className={currentView === "map" ? "tab active" : "tab"}
                                onClick={() => setCurrentView("map")}
                            >
                                Map View
                            </div>
                        </div>
                        <div className="content-container">
                            <div className="header-container">
                                <h1>{shiftType == "myShifts" ? "My" : "Search"} Shifts</h1>
                                <div className="btn-container">
                                    {userData?.data?.isAdmin && (
                                        <>
                                            <button id="whiteButton" className={"admin-btn"} onClick={openAddShift}>
                                                <img className="btn-icon" src={addShiftIcon} />
                                                {"Add Shift"}
                                            </button>

                                            <button
                                                id="whiteButton"
                                                className={"admin-btn"}
                                                onClick={() => {
                                                    void openDeleteModal();
                                                }}
                                                disabled={!showDeleteButton}
                                            >
                                                {isDeleteLoading ? (
                                                    <>
                                                        <LoadingSpinner />
                                                        {"Loading"}
                                                    </>
                                                ) : (
                                                    <>
                                                        <img className="btn-icon" src={deleteIcon} />
                                                        {"Delete Selected"}
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                id="whiteButton"
                                                className={"admin-btn"}
                                                onClick={handlePublish}
                                                disabled={!isPublishButtonEnabled} // Disable the button when isPublishButtonEnabled is false
                                            >
                                                {"Release"}
                                            </button>

                                            <button
                                                id="whiteButton"
                                                className={`admin-btn ${showUnreleased ? "unreleased-state" : ""}`}
                                                onClick={toggleUnreleasedShifts}
                                            >
                                                {showUnreleased ? "Show Released Shifts" : "Show Unreleased Shifts"}
                                            </button>
                                        </>
                                    )}

                                    {shiftType === "searchShifts" && (
                                        <button
                                            id="whiteButton"
                                            className={`admin-btn ${filterPanelVisible ? "highlighted" : ""}`}
                                            onClick={handleFilterPanel}
                                        >
                                            <img className="btn-icon" src={filterIcon} />
                                            {"Filters"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {currentView === "card" && (
                                <div className="shiftList-container">
                                    {isLoading && <p>Loading available shifts...</p>}
                                    {isError && (
                                        <p>There was a server error while loading available shifts... {error}</p>
                                    )}
                                    {data?.data &&
                                        data?.data
                                            .filter((shiftData) =>
                                                showUnreleased ? shiftData.isUnreleased : !shiftData.isUnreleased
                                            )
                                            .map((shiftData) => (
                                                <ShiftCard
                                                    key={shiftData._id}
                                                    shiftData={shiftData}
                                                    isAdmin={userData?.data?.isAdmin}
                                                    handleSelected={handleSelected}
                                                    className={showUnreleased ? "unreleased-state" : ""}
                                                    isUnreleased={shiftData.isUnreleased}
                                                />
                                            ))}
                                    {!isLoading && data?.data?.length === 0 && <p>No available shifts.</p>}
                                </div>
                            )}

                            {currentView === "calendar" && (
                                <div className="calendar-page">
                                    <Calendar
                                        localizer={localizer}
                                        events={data?.data?.map((shift) => ({
                                            start: new Date(shift.startAt),
                                            end: new Date(shift.endAt),
                                            title: shift.name,
                                            id: shift._id,
                                            // allDay: true,
                                        }))}
                                        startAccessor="start"
                                        endAccessor="end"
                                        titleAccessor="title"
                                        onSelectEvent={handleSelectEvent}
                                        style={{
                                            height: "75vh",
                                        }}
                                    />
                                </div>
                            )}
                            {currentView === "map" && <MapView />}
                        </div>
                    </div>
                    <div className="export-parent">
                        <button className="btn-primary export-button" onClick={() => setExportModalVisible(true)}>
                            Export
                        </button>
                    </div>
                    <ExportModal
                        visible={exportModalVisible}
                        onClose={() => setExportModalVisible(false)}
                        isAdmin={userData?.data?.isAdmin || false}
                    />
                    <Modal show={show}>
                        <AddShiftForm handleClose={closeAddShift} shiftdata={""} />
                    </Modal>
                    {!loadingAllVolTypes && resultFilters && (
                        <FilterResultsModal
                            visible={filterPanelVisible}
                            filters={resultFilters}
                            updateFilters={(filters) => {
                                setResultFilters(filters);
                                updateFiltersInSessionStorage(filters);
                            }}
                            onClose={() => setFilterPanelVisible(false)}
                            allVolTypes={allVolTypes?.data || []}
                            userVolTypes={userVolTypesData?.data || []}
                        />
                    )}
                    <Modal show={showDeleteModal} onHide={closeDeleteModal} animation={false}>
                        <Modal.Header closeButton>
                            <Modal.Title>Shift Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            You have selected {selectedShifts.length} shift/s to delete. Do you want to proceed?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeDeleteModal}>
                                No
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    closeDeleteModal();
                                    void deleteSelected();
                                }}
                            >
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </ModalBody>
            </WEITBackground>
        </>
    );
};

export { ShiftPage };
