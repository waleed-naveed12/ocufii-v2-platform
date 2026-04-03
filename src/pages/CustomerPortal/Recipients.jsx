import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import { useUser } from "../../context/CustomerPortal/UserContext";
import {
  getRecipients,
  deleteRecipient,
} from "../../api/CustomerPortal/RecipientsApi";
import Toast from "../../utility/CustomerPortal/Toast";
import { DashboardContent } from "../../styles/CustomerPortal/Dashboard.styled";
import { MdChevronRight, MdDelete } from "react-icons/md";
import RecipientDetails from "../../components/CustomerPortal/RecipientDetails";
import deleteImg from "../../assets/CustomerPortal/images/delete.svg";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";
import {
  RecipientsContainer,
  RecipientsCard,
  EmptyState,
  EmptyStateText,
  AccordionItem,
  AccordionHeader,
  AccordionLeft,
  AccordionIcon,
  RecipientName,
  AccordionRight,
  StatusBadge,
  DeleteButton,
  AccordionContent,
  AccordionBody,
  AddRecipientButton,
} from "../../styles/CustomerPortal/Recipients.styled";
import { useTranslation } from "react-i18next";
import DeleteMemberModal from "../../components/CustomerPortal/DeleteMemberModal/DeleteMemberModal";

const Recipients = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [deletingEmail, setDeletingEmail] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    recipient: null,
  });

  // Fetch recipients data
  const {
    data: recipientsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipients", user?.email],
    queryFn: () => getRecipients(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Transform API data to component format
  const recipients =
    recipientsData?.userNotify?.map((item, index) => ({
      id: item.recipient, // Use email as stable ID
      email: item.recipient,
      name: item.recipientName || item.recipient,
      enableSafety: item.enableSafety,
      enableSecurity: item.enableSecurity,
      enableLocation: item.enableLocation,
      safetyStatus: item.safetyStatus,
      securityStatus: item.securityStatus,
      notificationStatus: item.notificationStatus,
      userStatus: item.userStatus,
      senderName: item.senderName,
      dateCreated: item.dateCreated,
      mobileDevice: item.mobileDevice,
      deviceToken: item.deviceToken,
      freeUser: item.freeUser,
    })) || [];

  const toggleAccordion = (recipient) => {
    const id = recipient.id;
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleDeleteClick = (recipient) => {
    setDeleteModal({ isOpen: true, recipient });
  };

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, recipient: null });
  };

  const handleDeleteConfirm = async () => {
    const recipientEmail = deleteModal.recipient?.email;
    if (!recipientEmail) return;
    handleDeleteClose();
    setDeletingEmail(recipientEmail);
    const queryKey = ["recipients", user?.email];
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      userNotify:
        old?.userNotify?.filter((r) => r.recipient !== recipientEmail) ?? [],
    }));
    try {
      const result = await deleteRecipient({
        email: user?.email,
        recipient: recipientEmail,
      });
      if (result?.status === 200 || result?.status === 201) {
        Toast.success(result?.message || "Recipient removed successfully.");
      } else {
        queryClient.setQueryData(queryKey, previous);
        Toast.error(result?.message || "Failed to remove recipient.");
      }
    } catch (error) {
      queryClient.setQueryData(queryKey, previous);
      console.error("Error deleting recipient:", error);
      Toast.error("Failed to remove recipient. Please try again.");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleAddRecipient = () => {
    navigate(ROUTE.ADD_RECIPIENT);
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <RecipientsContainer>
          <PageTitle>{t("menu_myRecipients")}</PageTitle>

          {isLoading ? (
            <EmptyState>
              <EmptyStateText>{t("txt_loading")}</EmptyStateText>
            </EmptyState>
          ) : error ? (
            <EmptyState>
              <EmptyStateText>{t("txt_err_recipients")}</EmptyStateText>
            </EmptyState>
          ) : recipients.length === 0 ? (
            <EmptyState>
              <EmptyStateText>{t("text_no_recipients")}</EmptyStateText>
            </EmptyState>
          ) : (
            <RecipientsCard>
              {recipients.map((recipient, index) => (
                <AccordionItem key={recipient.id}>
                  <AccordionHeader>
                    <AccordionLeft onClick={() => toggleAccordion(recipient)}>
                      <AccordionIcon $isOpen={openAccordion === recipient.id}>
                        <MdChevronRight />
                      </AccordionIcon>
                      <RecipientName>
                        {t("personalSafety_Recipient")} - {index + 1}
                      </RecipientName>
                      {/* <StatusBadge status={recipient.userStatus}>
                        {recipient.userStatus === 0
                          ? t("recipients_Pending")
                          : recipient.userStatus === 1
                            ? t("recipients_Snoozed")
                            : recipient.userStatus === 2
                              ? t("recipients_Blocked")
                              : t("recipients_Unknown")}
                      </StatusBadge> */}
                    </AccordionLeft>
                    <AccordionRight>
                      <DeleteButton
                        onClick={() => handleDeleteClick(recipient)}
                        disabled={deletingEmail === recipient.email}
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
                    </AccordionRight>
                  </AccordionHeader>
                  <AccordionContent $isOpen={openAccordion === recipient.id}>
                    <AccordionBody>
                      <RecipientDetails recipient={recipient} />
                    </AccordionBody>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </RecipientsCard>
          )}

          <DeleteMemberModal
            isOpen={deleteModal.isOpen}
            member={deleteModal.recipient}
            onClose={handleDeleteClose}
            onConfirm={handleDeleteConfirm}
          />

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <AddRecipientButton onClick={handleAddRecipient} disabled={false}>
              + {t("recipients_Add")}
            </AddRecipientButton>
          </div>
        </RecipientsContainer>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Recipients;
