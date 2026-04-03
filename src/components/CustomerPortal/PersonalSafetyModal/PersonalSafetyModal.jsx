import React from "react";
import { MdInfo, MdClose } from "react-icons/md";
import { useTranslation } from "react-i18next";
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  ModalIconWrapper,
  ModalTitle,
  ModalDescription,
  ModalList,
  ModalListItem,
  ModalSection,
  ModalSectionTitle,
  ModalButton,
  CloseButton,
} from "../../../styles/CustomerPortal/PersonalSafety.styled";

const PersonalSafetyModal = ({ isOpen, onClose, isProfessional = false }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalContent>
          <ModalIconWrapper>
            <MdInfo />
          </ModalIconWrapper>

          <ModalTitle>
            {isProfessional
              ? t("modal_professional_monitored")
              : t("modal_personal_monitored")}
          </ModalTitle>

          {!isProfessional ? (
            <>
              <ModalDescription>{t("modal_personal_desc")}</ModalDescription>

              <ModalDescription style={{ fontWeight: 500 }}>
                {t("modal_included_with_app")}
              </ModalDescription>

              <ModalList>
                <ModalListItem>{t("modal_personal_service")}</ModalListItem>
                <ModalListItem>
                  {t("modal_one_recipient")}{" "}
                  <strong>{t("modal_one_recipient_bold")}</strong>
                </ModalListItem>
                <ModalListItem>
                  {t("modal_three_members")}{" "}
                  <strong>{t("modal_three_members_bold")}</strong>
                </ModalListItem>
                <ModalListItem>{t("modal_customize_buttons")}</ModalListItem>
                <ModalListItem>{t("modal_no_professional")}</ModalListItem>
              </ModalList>

              <ModalSection>
                <ModalSectionTitle>{t("modal_want_more")}</ModalSectionTitle>
                <ModalList>
                  <ModalListItem>{t("modal_upgrade_recipients")}</ModalListItem>
                  <ModalListItem>
                    {t("modal_upgrade_professional")}
                  </ModalListItem>
                  <ModalListItem>
                    {t("modal_to_upgrade")}{" "}
                    <strong>{t("modal_manage_subscriptions")}</strong>
                  </ModalListItem>
                </ModalList>
              </ModalSection>
            </>
          ) : (
            <>
              <ModalDescription>
                {t("modal_professional_desc")}
              </ModalDescription>

              <ModalDescription style={{ fontWeight: 500 }}>
                {t("modal_professional_includes")}
              </ModalDescription>

              <ModalList>
                <ModalListItem>{t("modal_24_7_monitoring")}</ModalListItem>
                <ModalListItem>
                  {t("modal_emergency_coordination")}
                </ModalListItem>
                <ModalListItem>{t("modal_direct_communication")}</ModalListItem>
                <ModalListItem>{t("modal_all_features")}</ModalListItem>
              </ModalList>

              <ModalSection>
                <ModalSectionTitle>
                  {t("modal_upgrade_to_professional")}
                </ModalSectionTitle>
                <ModalList>
                  <ModalListItem>
                    {t("modal_enable_professional")}{" "}
                    <strong>{t("modal_manage_subscriptions")}</strong>{" "}
                    {t("modal_purchase_professional")}
                  </ModalListItem>
                </ModalList>
              </ModalSection>
            </>
          )}

          <ModalButton onClick={onClose}>{t("common_Ok")}</ModalButton>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PersonalSafetyModal;
