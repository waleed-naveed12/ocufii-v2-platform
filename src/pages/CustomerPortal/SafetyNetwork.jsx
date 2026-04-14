import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../../context/CustomerPortal/UserContext";
import {
  getSafetyNetworkMembers,
  getSafetyNetworkMemberDetails,
  pingMemberLocations,
  getMemberLocations,
  deleteMember,
  updateMember,
  changeStatus,
  sendTestAlert,
} from "../../api/CustomerPortal/SafetyNetworkApi";
import { getDashboard } from "../../api/CustomerPortal/DashboardApi";
import warningIcon from "../../assets/CustomerPortal/images/warning.svg";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import { MdChevronRight } from "react-icons/md";
import { HiLink } from "react-icons/hi";
import unlinkImg from "../../assets/CustomerPortal/images/unlink.png";
import linkImg from "../../assets/CustomerPortal/images/bold-img/bold-Link.png";
import pendingImg from "../../assets/CustomerPortal/images/bold-img/Link.png";
import ManageSnooze from "../../components/CustomerPortal/ManageSnooze/ManageSnooze";
import {
  SafetyNetworkContainer,
  PageTitle,
  ButtonGroup,
  ActionButton,
  MembersCard,
  EmptyState,
  EmptyStateText,
  MemberItem,
  MemberHeader,
  AccordionIcon,
  MemberLeft,
  MemberIcon,
  MemberInfo,
  MemberName,
  MemberNameText,
  StatusBadge,
  MemberEmail,
  MemberRight,
  DeleteButton,
  AccordionContent,
  AccordionBody,
} from "../../styles/CustomerPortal/SafetyNetwork.styled";
import sendEmail from "../../assets/CustomerPortal/images/sendEmail.png";
import receiveEmail from "../../assets/CustomerPortal/images/recieveEmail.png";
import deleteImg from "../../assets/CustomerPortal/images/delete.svg";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import DeleteMemberModal from "../../components/CustomerPortal/DeleteMemberModal/DeleteMemberModal";
import MemberDetails from "../../components/CustomerPortal/MemberDetails";
import SafetyNetworkMap from "../../components/CustomerPortal/SafetyNetworkMap/SafetyNetworkMap";
import { CiLocationOn } from "react-icons/ci";
import { Loader } from "../../styles/CustomerPortal/Loader";
import Toast from "../../utility/CustomerPortal/Toast";
import { getUserStatusLabel } from "../../utility/CustomerPortal/DeviceMapping";
import { useTranslation } from "react-i18next";

const SafetyNetwork = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [memberLocations, setMemberLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  // ManageSnooze full-page state: { member, snoozeView } | null
  const [manageSnoozeData, setManageSnoozeData] = useState(null);
  const [showNotAllowedModal, setShowNotAllowedModal] = useState(false);

  // Fetch active alerts to check for non-cancelled safety alerts
  const { data: activeAlertsData } = useQuery({
    queryKey: ["activeAlertsForSafetyNetwork", user?.email],
    queryFn: () => getDashboard(user?.email, 10, "all"),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  // True when the most recent safety alert is not cancelled
  const hasActiveAlert = (() => {
    const firstSafety = activeAlertsData?.data?.safety?.alerts?.[0];
    if (!firstSafety) return false;
    return !firstSafety.notificationReason?.includes("Canceled");
  })();

  // Fetch safety network members
  const { data: safetyNetworkData, isLoading } = useQuery({
    queryKey: ["safetyNetworkMembers", user?.email],
    queryFn: () => getSafetyNetworkMembers(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Transform API data to component format
  const members =
    safetyNetworkData?.safetyLinks?.map((link, index) => ({
      id: index + 1,
      name: link.recipientName || link.linkedMember,
      email: link.linkedMember,
      status: getUserStatusLabel(link.userStatus),
      enableLocation: link.enableLocation,
      enableSafety: link.enableSafety,
      enableSecurity: link.enableSecurity,
      userType: link.userType,
      dateCreated: link.dateCreated,
      dateUpdated: link.dateUpdated,
      notificationStatus: link.notificationStatus,
      senderName: link.senderName,
      snoozeEndTime: link.snoozeEndTime,
      snoozeStartTime: link.snoozeStartTime,
      unlinkedBy: link.unlinkedBy,
    })) || [];

  // Get the email of the currently opened member
  const openMemberEmail = openAccordion
    ? members.find((m) => m.id === openAccordion)?.email
    : null;

  // Fetch member details when accordion opens
  const { data: memberDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["safetyNetworkMemberDetails", user?.email, openMemberEmail],
    queryFn: () => getSafetyNetworkMemberDetails(user?.email, openMemberEmail),
    enabled: !!user?.email && !!openMemberEmail,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider data stale to ensure fresh fetch on accordion open
    refetchOnMount: true, // Always refetch when component mounts
    cacheTime: 0, // Don't cache the data
  });

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleInvite = () => {
    navigate(ROUTE.INVITE_CONTACT);
  };

  const handleViewLocation = async () => {
    try {
      setIsLoadingLocations(true);
      setTimer(15);
      setMemberLocations([]);

      // Clear any existing timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (fetchIntervalRef.current) clearTimeout(fetchIntervalRef.current);

      // Call ping member locations API
      await pingMemberLocations(user?.email);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Fetch member locations after 15 seconds
      fetchIntervalRef.current = setTimeout(async () => {
        try {
          const result = await getMemberLocations(user?.email);
          if (result && result.members) {
            console.log("Member locations fetched:", result.members);
            // Filter members with valid lat/lng
            const validMembers = result.members.filter(
              (member) =>
                member.lat &&
                member.long &&
                member.lat !== "" &&
                member.long !== "",
            );
            setMemberLocations(validMembers);
            if (validMembers.length > 0) {
              setShowMap(true);
              Toast.success(t("toast_member_locations_retrieved"));
            } else {
              Toast.info(t("toast_no_valid_locations"));
            }
          } else {
            Toast.info(t("toast_no_member_locations"));
            setMemberLocations([]);
          }
        } catch (error) {
          console.error("Error fetching member locations:", error);
          Toast.error(t("toast_member_locations_fetch_failed"));
          setMemberLocations([]);
        } finally {
          setIsLoadingLocations(false);
        }
      }, 15000);
    } catch (error) {
      console.error("Error pinging members:", error);
      Toast.error(t("toast_ping_members_failed"));
      setIsLoadingLocations(false);
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setMemberLocations([]);
    setTimer(0);
    setIsLoadingLocations(false);

    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (fetchIntervalRef.current) clearTimeout(fetchIntervalRef.current);
  };

  const handleAcceptInvitation = () => {
    navigate(ROUTE.ACCEPT_INVITE);
  };

  const handleDelete = (id) => {
    if (hasActiveAlert) {
      setShowNotAllowedModal(true);
      return;
    }
    const member = members.find((m) => m.id === id);
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (id) => {
    if (!selectedMember) return;
    try {
      const result = await deleteMember({
        email: user?.email,
        linkedMember: selectedMember.email,
      });
      if (result?.status === 200) {
        Toast.success(result?.message || "Member deleted successfully.");
      } else {
        Toast.error(result?.message || "Failed to delete member.");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      Toast.error("Failed to delete member. Please try again.");
    } finally {
      setSelectedMember(null);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDelete = () => {
    setSelectedMember(null);
    setShowDeleteModal(false);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fetchIntervalRef.current) clearTimeout(fetchIntervalRef.current);
    };
  }, []);

  // If manage snooze page is active, render it full-screen replacing all SafetyNetwork content
  if (manageSnoozeData) {
    return (
      <DashboardLayout>
        <DashboardContent>
          <ManageSnooze
            member={manageSnoozeData.member}
            snoozeView={manageSnoozeData.snoozeView}
            setSnoozeView={(view) => {
              if (view === null) {
                setManageSnoozeData(null);
              } else {
                setManageSnoozeData((prev) => ({ ...prev, snoozeView: view }));
              }
            }}
            getSnoozeTimeDisplay={() => {
              const snoozeEndTime = manageSnoozeData.inbound?.snoozeEndTime;
              if (!snoozeEndTime) return null;
              const endTime = new Date(snoozeEndTime + 'Z');
              const diffMs = endTime - Date.now();
              if (diffMs <= 0) return null;
              const totalMinutes = Math.floor(diffMs / 60000);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              if (hours > 0) return `${hours} Hrs ${minutes} Minutes Remaining`;
              return `${minutes} Minutes Remaining`;
            }}
            getSnoozeMinutesRemaining={() => {
              const snoozeEndTime = manageSnoozeData.inbound?.snoozeEndTime;
              if (!snoozeEndTime) return 0;
              const endTime = new Date(snoozeEndTime + 'Z');
              const diffMs = endTime - Date.now();
              if (diffMs <= 0) return 0;
              return Math.floor(diffMs / 60000);
            }}
            onExtendConfirm={async () => {
              const result = await changeStatus({
                email: manageSnoozeData.inbound?.email,
                linkedMember: manageSnoozeData.inbound?.linkedMember,
                userStatus: 5,
              });
              if (result?.code === 200) {
                setManageSnoozeData((prev) => ({
                  ...prev,
                  snoozeView: "manage",
                  inbound: { ...prev.inbound, snoozeEndTime: result.snoozeEndTime },
                }));
                Toast.success(result?.message || "Snooze extended.");
              } else {
                setManageSnoozeData((prev) => ({ ...prev, snoozeView: "manage" }));
                Toast.error(result?.message || "Failed to extend snooze.");
              }
            }}
            onCancelConfirm={async () => {
              setManageSnoozeData(null);
              const result = await changeStatus({
                email: manageSnoozeData.inbound?.email,
                linkedMember: manageSnoozeData.inbound?.linkedMember,
                userStatus: 1,
              });
              if (result?.code === 200) Toast.success(result?.message || "Snooze cancelled.");
              else Toast.error(result?.message || "Failed to cancel snooze.");
            }}
            actionLoading={null}
          />
        </DashboardContent>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Loading overlay for fetching member locations */}
        {isLoadingLocations && timer > 0 && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "40px 60px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <Loader size="24px" />
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {t("txt_loading")}
              </div>
              {/* <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "8px",
                }}
              >
                {timer} seconds remaining
              </div> */}
            </div>
          </div>
        )}

        <SafetyNetworkContainer>
          <PageTitle>{t("menu_mySafetyNetwork")}</PageTitle>
          <DeleteMemberModal
            isOpen={showDeleteModal}
            member={selectedMember}
            onClose={handleCloseDelete}
            onConfirm={handleConfirmDelete}
          />

          {/* NOT ALLOWED modal — shown when a safety alert is active */}
          {showNotAllowedModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "36px 32px",
                  maxWidth: "360px",
                  width: "90%",
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={warningIcon}
                  alt="Warning"
                  style={{ width: 56, height: 56, marginBottom: 16 }}
                />
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "#222",
                  }}
                >
                  NOT ALLOWED
                </div>
                <p style={{ fontSize: 14, color: "#444", marginBottom: 8 }}>
                  You cannot make any changes, edits, or additions to the app
                  while a safety alert is active.
                </p>
                <p style={{ fontSize: 14, color: "#444", marginBottom: 24 }}>
                  To make changes, please cancel the current alert first.
                </p>
                <button
                  onClick={() => setShowNotAllowedModal(false)}
                  style={{
                    background: "#2196F3",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 48px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
          <ButtonGroup>
            <ActionButton onClick={handleInvite} disabled={false}>
              <img src={sendEmail} alt="Send Email" />
              <div style={{ textAlign: "left" }}>
                <div>{t("safetyNetwork_Invite")}</div>
                {/* <div>to My Safety Network</div> */}
              </div>
            </ActionButton>
            <ActionButton onClick={handleAcceptInvitation} disabled={false}>
              <img src={receiveEmail} alt="Receive Email" />
              <div style={{ textAlign: "left" }}>
                <div>{t("safetyNetwork_Accept_Invite")}</div>
              </div>
            </ActionButton>
            <ActionButton onClick={handleViewLocation}>
              <CiLocationOn size={24} />
              <div style={{ textAlign: "left" }}>
                <div>{t("txt_locate")}</div>
              </div>
            </ActionButton>
          </ButtonGroup>

          {/* Show map when View Location is clicked */}
          {showMap && memberLocations.length > 0 && (
            <SafetyNetworkMap
              key="safety-network-map"
              members={memberLocations}
              onClose={handleCloseMap}
            />
          )}

          {isLoading ? (
            <EmptyState>
              <EmptyStateText>{t("txt_loading")}</EmptyStateText>
            </EmptyState>
          ) : members.length === 0 ? (
            <EmptyState>
              <EmptyStateText>{t("txt_no_members")}</EmptyStateText>
            </EmptyState>
          ) : (
            <MembersCard>
              {members.map((member) => (
                <MemberItem key={member.id}>
                  <MemberHeader>
                    <MemberLeft
                      onClick={() =>
                        member.status !== "PENDING" &&
                        toggleAccordion(member.id)
                      }
                      style={{
                        cursor:
                          member.status === "PENDING" ? "default" : "pointer",
                      }}
                    >
                      {member.status !== "PENDING" && (
                        <AccordionIcon $isOpen={openAccordion === member.id}>
                          <MdChevronRight />
                        </AccordionIcon>
                      )}
                      <MemberIcon>
                        {/* {console.log("Member status:", member.status)} */}
                        {member.status === "PENDING" ? (
                          <img
                            src={pendingImg}
                            alt="link"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        ) : member.status === "NOT LINKED" ? (
                          <img
                            src={unlinkImg}
                            alt="unlink"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <img
                            src={linkImg}
                            alt="link"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </MemberIcon>
                      <MemberInfo>
                        <MemberName>
                          <MemberNameText>{member.name}</MemberNameText>
                          <StatusBadge status={member.status}>
                            {t(
                              `status_${member.status.toLowerCase().replace(/ /g, "_")}`,
                            )}
                          </StatusBadge>
                        </MemberName>
                        <MemberEmail>{member.email}</MemberEmail>
                      </MemberInfo>
                    </MemberLeft>
                    <MemberRight>
                      <DeleteButton
                        onClick={() => handleDelete(member.id)}
                      >
                        <img
                          src={deleteImg}
                          alt="delete"
                          style={{
                            width: 20,
                            height: 20,
                            objectFit: "contain",
                          }}
                        />
                      </DeleteButton>
                    </MemberRight>
                  </MemberHeader>
                  <AccordionContent $isOpen={openAccordion === member.id}>
                    <AccordionBody>
                      {isLoadingDetails ? (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                          {t("txt_loading")}
                        </div>
                      ) : (
                        <MemberDetails
                          key={`${member.email}-${openAccordion}`}
                          member={member}
                          outbound={memberDetails?.data?.outbound}
                          inbound={memberDetails?.data?.inbound}
                          onManageSnooze={(freshSnoozeEndTime) =>
                            setManageSnoozeData({
                              member,
                              inbound: freshSnoozeEndTime
                                ? { ...memberDetails?.data?.inbound, snoozeEndTime: freshSnoozeEndTime }
                                : memberDetails?.data?.inbound,
                              snoozeView: "manage",
                            })
                          }
                          onUpdateMember={async ({ enableSafety, enableLocation, enableSecurity }) => {
                            if (hasActiveAlert && enableSafety !== member.enableSafety) {
                              setShowNotAllowedModal(true);
                              throw new Error("NOT_ALLOWED");
                            }
                            const result = await updateMember({
                              email: user?.email,
                              linkedMember: member.email,
                              senderName: member.senderName,
                              recipientName: member.name,
                              enableSafety,
                              enableLocation,
                              enableSecurity,
                            });
                            if (result?.status !== 200) {
                              throw new Error(result?.message || "Update failed");
                            }
                          }}
                          onChangeStatus={async ({ userStatus, email, linkedMember }) => {
                            const result = await changeStatus({
                              email,
                              linkedMember,
                              userStatus,
                            });
                            if (result?.code === 200) {
                              Toast.success(result?.message || "Status updated.");
                              return result;
                            } else {
                              Toast.error(result?.message || "Failed to update status.");
                              throw new Error(result?.message || "Failed to update status.");
                            }
                          }}
                          onSendTestAlert={async () => {
                            const result = await sendTestAlert({
                              email: user?.email,
                              linkedMember: member.email,
                              userId: user?.userId || user?.id || "",
                            });
                            // Always invalidate so the accordion picks up the latest notificationStatus
                            await queryClient.invalidateQueries({ queryKey: ["safetyNetworkMemberDetails", user?.email, member.email] });
                            if (result?.status === 200 || result?.code === 200) {
                              // Return result so MemberDetails can read notificationStatus directly
                              return result;
                            } else {
                              throw new Error(result?.message || "Failed to send test alert.");
                            }
                          }}
                          onUnlink={() => {
                            // TODO: Implement API call to unlink member
                            console.log("Unlink member:", member.email);
                          }}
                        />
                      )}
                    </AccordionBody>
                  </AccordionContent>
                </MemberItem>
              ))}
            </MembersCard>
          )}
        </SafetyNetworkContainer>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default SafetyNetwork;
