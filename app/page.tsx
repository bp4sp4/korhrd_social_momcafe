"use client";

import Image from "next/image";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./stepflow.module.css";
import { CAFE_CONFIG, CAFE_NAMES } from "@/lib/cafe-names";

const formatClickSource = (
  utmSource: string,
  materialId: string | null,
  blogId: string | null = null,
  cafeId: string | null = null,
): string => {
  const sourceMap: { [key: string]: string } = {
    daangn: "당근",
    insta: "인스타",
    facebook: "페이스북",
    google: "구글",
    youtube: "유튜브",
    kakao: "카카오",
    naver: "네이버",
    naverblog: "네이버블로그",
    toss: "토스",
    mamcafe: "맘카페",
  };

  const cafeNameMap = CAFE_NAMES;

  const shortSource = sourceMap[utmSource] || utmSource;

  if (blogId) {
    return `${shortSource}_${blogId}`;
  }
  if (cafeId) {
    const cafeName = cafeNameMap[cafeId] || cafeId;
    return `${shortSource}_${cafeName}`;
  }
  if (materialId) {
    return `${shortSource}_소재_${materialId}`;
  }
  return shortSource;
};

// URL 파라미터를 읽는 컴포넌트
function ClickSourceHandler({
  onSourceChange,
}: {
  onSourceChange: (source: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get("utm_source");
    const materialId = searchParams.get("material_id");
    const blogId = searchParams.get("blog_id");
    const cafeId = searchParams.get("cafe_id");

    if (utmSource) {
      const formatted = formatClickSource(
        utmSource,
        materialId,
        blogId,
        cafeId,
      );
      onSourceChange(formatted);
    } else {
      // referrer로 네이버카페 감지
      const referrer = document.referrer;
      console.log('[referrer]', referrer);
      const matched = CAFE_CONFIG.find(cafe =>
        referrer.includes(`cafe.naver.com/${cafe.id}`) ||
        referrer.includes(`/cafes/${cafe.id}`) ||
        (cafe.numericId && referrer.includes(`cafes/${cafe.numericId}`))
      );
      if (matched) {
        onSourceChange(`맘카페_${matched.name}`);
      } else if (referrer.includes("cafe.naver.com")) {
        onSourceChange("네이버카페_referrer");
      }
    }
  }, [searchParams, onSourceChange]);

  return null;
}

const CERT_CATEGORIES = [
  {
    label: "전체과정",
    options: [
      "병원동행매니저1급",
      "노인돌봄생활지원사1급",
      "방과후돌봄교실지도사1급",
      "바리스타1급",
      "타로심리상담사1급",
      "심리상담사1급",
      "아동요리지도사1급",
      "노인심리상담사1급",
      "다문화심리상담사1급",
      "독서논술지도사1급",
      "독서지도사1급",
      "동화구연지도사1급",
      "디지털중독예방지도사1급",
      "미술심리상담사1급",
      "미술심리상담사2급",
      "방과후수학지도사1급",
      "스토리텔링수학지도사1급",
      "방과후아동지도사1급",
      "방과후학교지도사1급",
      "병원코디네이터1급",
      "부동산권리분석사1급",
      "부모교육상담사1급",
      "북아트1급",
      "산모신생아건강관리사",
      "산후관리사",
      "손유희지도사1급",
      "스피치지도사1급",
      "실버인지활동지도사1급",
      "심리분석사1급",
      "아동공예지도자",
      "아동미술심리상담사",
      "아동미술지도사",
      "아동미술심리상담사1급",
      "안전교육지도사",
      "안전관리사",
      "안전교육지도사1급",
      "영어동화구연지도사",
      "유튜브크리에이터",
      "음악심리상담사",
      "이미지메이킹스피치",
      "인성지도사1급",
      "인성지도사2급",
      "자기주도학습지도사1급",
      "자기주도학습지도사2급",
      "자원봉사지도사1급",
      "종이접기지도사",
      "지역아동교육지도사1급",
      "진로적성상담사1급",
      "코딩지도사",
      "클레이아트지도사",
      "프레젠테이션스피치",
      "학교폭력예방상담사1급",
      "NIE지도사1급",
      "교육마술지도사1급",
      "POP디자인지도사",
      "SNS마케팅전문가",
    ],
  },
  {
    label: "실버과정",
    options: [
      "생활지원사1급",
      "노인심리상담사1급",
      "병원동행매니저1급",
      "실버인지활동지도사1급",
      "안전교육지도사1급",
      "자원봉사지도사1급",
    ],
  },
  {
    label: "아동과정",
    options: [
      "아동미술지도사1급",
      "아동요리지도사1급",
      "손유희지도사1급",
      "종이접기지도사1급",
      "클레이아트지도사1급",
      "북아트1급",
    ],
  },
  {
    label: "방과후과정",
    options: [
      "방과후돌봄교실지도사1급",
      "방과후아동지도사1급",
      "영어동화구연지도사1급",
      "코딩지도사1급",
      "독서논술지도사1급",
      "진로적성상담사1급",
      "학교폭력예방상담사1급",
    ],
  },
  {
    label: "심리과정",
    options: [
      "심리상담사1급",
      "심리분석사1급",
      "미술심리상담사1급",
      "음악심리상담사1급",
      "부모교육상담사1급",
      "진로적성상담사1급",
      "학교폭력예방상담사1급",
    ],
  },
  {
    label: "커피과정",
    options: ["바리스타1급"],
  },
  {
    label: "취·창업과정",
    options: [
      "타로심리상담사1급",
      "바리스타1급",
      "안전관리사1급",
      "안전교육지도사1급",
      "산모신생아건강관리사1급",
      "산후관리사1급",
      "SNS마케팅전문가1급",
      "유튜브크리에이터1급",
    ],
  },
];

function StepFlowContent({ clickSource }: { clickSource: string }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", // 이름
    contact: "", // 연락처
    education: "", // 최종학력
    hope_course: "", // 희망과정
    reason: "", // 취득사유
    mamcafe_activity: "", // 활동 맘카페
  });
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [showModalArrow, setShowModalArrow] = useState(true);
  const certListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCertModal) setShowModalArrow(true);
  }, [showCertModal, selectedCategoryIdx]);

  const handleCertListScroll = () => {
    if ((certListRef.current?.scrollTop ?? 0) > 10) setShowModalArrow(false);
  };

  const selectedCerts = formData.hope_course
    ? formData.hope_course.split(", ").filter(Boolean)
    : [];

  const toggleCert = (cert: string) => {
    const updated = selectedCerts.includes(cert)
      ? selectedCerts.filter((c) => c !== cert)
      : [...selectedCerts, cert];
    setFormData({ ...formData, hope_course: updated.join(", ") });
  };

  const toggleCategoryAll = (idx: number) => {
    const catOptions = CERT_CATEGORIES[idx].options;
    const allSelected = catOptions.every((o) => selectedCerts.includes(o));
    if (allSelected) {
      const updated = selectedCerts.filter((c) => !catOptions.includes(c));
      setFormData({ ...formData, hope_course: updated.join(", ") });
    } else {
      const toAdd = catOptions.filter((o) => !selectedCerts.includes(o));
      setFormData({ ...formData, hope_course: [...selectedCerts, ...toAdd].join(", ") });
    }
  };

  const deselectAll = () => {
    setFormData({ ...formData, hope_course: "" });
  };

  // 연락처 포맷팅 (010-XXXX-XXXX)
  const formatContact = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  // 연락처 검증
  const validateContact = (contact: string) => {
    const cleaned = contact.replace(/[-\s]/g, "");
    if (cleaned.length === 0) {
      setContactError("");
      return true;
    }
    if (!cleaned.startsWith("010") && !cleaned.startsWith("011")) {
      setContactError("010 또는 011로 시작하는 번호를 입력해주세요");
      return false;
    }
    setContactError("");
    return true;
  };

  // 데이터 저장 로직
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          education: formData.education,
          hope_course: formData.hope_course,
          major_category: CERT_CATEGORIES
            .filter(cat => cat.options.some(opt => selectedCerts.includes(opt)))
            .map(cat => cat.label)
            .join(", "),
          reason: formData.reason,
          mamcafe_activity: formData.mamcafe_activity,
          click_source: formData.mamcafe_activity
            ? `맘카페_${formData.mamcafe_activity}`
            : '맘카페',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "저장에 실패했습니다.");
      }

      setStep(3);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        error instanceof Error
          ? error.message
          : "저장에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.length > 0 &&
    formData.contact.replace(/[-\s]/g, "").length >= 10 &&
    !contactError &&
    formData.hope_course.length > 0 &&
    formData.reason.length > 0 &&
    formData.mamcafe_activity.length > 0 &&
    privacyAgreed;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="한평생교육"
            style={{ height: "34px", width: "auto" }}
          />
        </div>
      </header>
      <AnimatePresence mode="wait">
        {/* STEP 1: 빈 화면 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={styles.stepWrapper}
          >
            {/* 하단 안내 및 다음 버튼 */}
            <div className={styles.infoSection}>
              <div className={styles.infoInner}>
                <div style={{ textAlign: "left", marginBottom: "24px" }}>
                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    취업자격증 상담신청
                  </p>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>1</div> 선착순 수업료 전액면제
                  </div>
                  <div className={styles.infoDesc}>
                    원래 수업료 30만원 {"->"} 전액면제
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>2</div> 응시료 면제
                  </div>
                  <div className={styles.infoDesc}>
                    온라인 시험, 재시험 가능
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>3</div> 온라인 수업
                  </div>
                  <div className={styles.infoDesc}>
                   모든 수업은 100% 온라인으로 진행
                  </div>
                </div>
                <div className={styles.infoSection}>
                  <button
                    className={styles.bottomButton}
                    onClick={() => setStep(2)}
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* STEP 2: 기존 정보입력 폼 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={styles.stepWrapper}
          >
            <div style={{ textAlign: "left", marginBottom: "24px" }}>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                무료 학습 상담 신청
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                이름을 입력해주세요 <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                className={styles.inputField}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                연락처를 입력해주세요{" "}
                <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                className={styles.inputField}
                value={formData.contact}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted = formatContact(value);
                  setFormData({ ...formData, contact: formatted });
                  validateContact(formatted);
                }}
              />
              {contactError && (
                <p className={styles.errorMessage}>{contactError}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                희망과정을 선택해주세요{" "}
                <span style={{ color: "#EF4444" }}>*</span>
                <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 400 }}> (복수선택 가능)</span>
              </label>
              <button
                type="button"
                className={styles.certTriggerButton}
                onClick={() => setShowCertModal(true)}
              >
                {selectedCerts.length > 0 ? (
                  <span className={styles.certTriggerSelected}>
                    {selectedCerts.length}개 선택됨: {selectedCerts.slice(0, 2).join(", ")}{selectedCerts.length > 2 ? ` 외 ${selectedCerts.length - 2}개` : ""}
                  </span>
                ) : (
                  <span className={styles.certTriggerPlaceholder}>과정을 선택해주세요</span>
                )}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                취득사유가 어떻게 되시나요? <span style={{ color: "#EF4444" }}>*</span>
                <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "13px" }}> (복수선택 가능)</span>
              </label>
              <div className={styles.reasonCheckGroup}>
                {["즉시취업", "이직", "미래준비", "취미"].map((opt) => {
                  const selected = formData.reason
                    ? formData.reason.split(", ").filter(Boolean).includes(opt)
                    : false;
                  return (
                    <label key={opt} className={`${styles.reasonCheckItem} ${selected ? styles.reasonCheckItemSelected : ""}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const current = formData.reason
                            ? formData.reason.split(", ").filter(Boolean)
                            : [];
                          const updated = selected
                            ? current.filter((r) => r !== opt)
                            : [...current, opt];
                          setFormData({ ...formData, reason: updated.join(", ") });
                        }}
                        style={{ display: "none" }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                활동하고 계신 맘카페를 적어주세요 <span style={{ color: "#EF4444" }}>*</span>
                <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "13px" }}> (제휴여부 확인)</span>
              </label>
              <input
                type="text"
                placeholder="예) 한평생맘, 창동맘"
                className={styles.inputField}
                value={formData.mamcafe_activity}
                onChange={(e) =>
                  setFormData({ ...formData, mamcafe_activity: e.target.value })
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className={styles.privacyLink}
                  >
                    개인정보처리방침
                  </button>{" "}
                  동의 <span style={{ color: "#EF4444" }}>*</span>
                </span>
              </label>
            </div>

            <button
              className={styles.bottomButton}
              disabled={!isFormValid || loading}
              onClick={handleSubmit}
            >
              {loading ? "처리 중..." : "제출하기"}
            </button>
          </motion.div>
        )}
        {/* STEP 3: 완료 화면 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={styles.stepWrapper}
            style={{ textAlign: "center", justifyContent: "center" }}
          >
            <Image
              src="/complete-check.png"
              alt="Done"
              width={300}
              height={300}
              priority
              style={{ margin: "0 auto 24px" }}
            />
            <h1 className={styles.title}>
              신청이 완료되었습니다.{"\n"}곧 연락드리겠습니다.
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 자격증 선택 모달 */}
      {showCertModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCertModal(false)}>
          <div className={styles.certModalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.certModalHeader}>
              <h3 className={styles.certModalTitle}>과정 선택</h3>
              <button className={styles.certModalCloseButton} onClick={() => setShowCertModal(false)}>✕</button>
            </div>

            <div className={styles.certModalBody}>
              {/* 좌측: 카테고리 */}
              <div className={styles.certCategoryList}>
                {CERT_CATEGORIES.map((cat, idx) => (
                  <button
                    key={idx}
                    className={`${styles.certCategoryItem} ${idx === selectedCategoryIdx ? styles.certCategoryItemActive : styles.certCategoryItemInactive}`}
                    onClick={() => setSelectedCategoryIdx(idx)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 우측: 자격증 목록 */}
              <div className={styles.certSelectAreaWrapper}>
                <div
                  className={styles.certListWrapper}
                  ref={certListRef}
                  onScroll={handleCertListScroll}
                  style={{ position: "relative" }}
                >
                  <div className={styles.certCategorySection}>
                    <div className={styles.certListContainer}>
                      <button
                        onClick={() => toggleCategoryAll(selectedCategoryIdx)}
                        className={`${styles.certListItem} ${CERT_CATEGORIES[selectedCategoryIdx].options.every((o) => selectedCerts.includes(o)) ? styles.certListItemSelected : ""}`}
                      >
                        <span>전체</span>
                        {CERT_CATEGORIES[selectedCategoryIdx].options.every((o) => selectedCerts.includes(o)) && <span>✓</span>}
                      </button>
                      {CERT_CATEGORIES[selectedCategoryIdx].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleCert(opt)}
                          className={`${styles.certListItem} ${selectedCerts.includes(opt) ? styles.certListItemSelected : ""}`}
                        >
                          <span>{opt}</span>
                          {selectedCerts.includes(opt) && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {showModalArrow && (
                    <motion.div
                      key="modal-arrow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "sticky",
                        bottom: 0,
                        display: "flex",
                        justifyContent: "center",
                        pointerEvents: "none",
                        paddingBottom: "4px",
                        paddingRight : "30px"
                      }}
                    >
                      <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 선택된 과정 태그 */}
            <div className={styles.selectedCertContainer}>
              <div className={styles.selectedCertLabel}>
                <span>선택한 과정 <span className={styles.selectedCertCount}>{selectedCerts.length}</span></span>
              </div>
              <div className={styles.selectedCertList}>
                {selectedCerts.map((cert) => (
                  <div key={cert} className={styles.selectedCertTag}>
                    <span>{cert}</span>
                    <button className={styles.removeTagButton} onClick={() => toggleCert(cert)}>✕</button>
                  </div>
                ))}
                {selectedCerts.length === 0 && (
                  <div className={styles.noCertMessage}>선택한 과정이 없습니다</div>
                )}
              </div>
            </div>

            <div className={styles.certModalFooter}>
              <button className={styles.certModalResetButton} onClick={deselectAll}>
                <div className={styles.resetButtonContent}>
                  <span>초기화</span>
                  <div className={styles.resetIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2.03321C6.33627 2.03326 4.9234 2.61176 3.76758 3.76758C2.61175 4.92341 2.03326 6.33627 2.0332 8C2.03324 9.66366 2.61189 11.0766 3.76758 12.2324C4.92338 13.3881 6.33634 13.9667 8 13.9668C9.15476 13.9668 10.206 13.6683 11.1514 13.0713C12.0942 12.4758 12.8209 11.6814 13.3301 10.6895C13.4449 10.4884 13.4505 10.2715 13.3535 10.0498C13.2569 9.82916 13.0935 9.6795 12.8691 9.60938C12.6659 9.54261 12.463 9.5463 12.2646 9.6211C12.0646 9.69663 11.9086 9.83209 11.7998 10.0225L11.7988 10.0244C11.4289 10.718 10.9062 11.2704 10.2305 11.6826C9.55588 12.0941 8.81313 12.2998 8 12.2998C6.8041 12.2998 5.79066 11.8824 4.9541 11.0459C4.11766 10.2093 3.69926 9.1959 3.69922 8C3.69928 6.80403 4.11752 5.79069 4.9541 4.9541C5.79069 4.11752 6.80403 3.69928 8 3.69922C8.77737 3.69925 9.49674 3.89055 10.1592 4.27246C10.7709 4.62529 11.261 5.10193 11.6338 5.69922H9.4668C9.23471 5.69928 9.03476 5.78025 8.87402 5.94043C8.71317 6.10077 8.63235 6.30061 8.63281 6.53321C8.63336 6.76551 8.71437 6.96565 8.87402 7.12598C9.03393 7.2863 9.23401 7.36616 9.4668 7.36621H13.1338C13.3662 7.36664 13.5662 7.28728 13.7266 7.12696C13.887 6.96653 13.9668 6.76618 13.9668 6.53321V2.86621C13.9677 2.6342 13.8881 2.43412 13.7275 2.27344C13.5667 2.11272 13.3655 2.03266 13.1328 2.03321C12.9007 2.03391 12.7012 2.1138 12.541 2.27344C12.3805 2.43339 12.2999 2.63329 12.2998 2.86621V3.88672C11.7771 3.32321 11.1639 2.88126 10.4609 2.56348C9.67821 2.20974 8.85733 2.03323 8 2.03321Z" fill="#656565"/>
                    </svg>
                  </div>
                </div>
              </button>
              <button className={styles.certModalConfirmButton} onClick={() => setShowCertModal(false)}>
                선택하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacyModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className={styles.modalPrivacy}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalPrivacyHeader}>
              <h3 className={styles.modalPrivacyTitle}>개인정보처리방침</h3>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowPrivacyModal(false)}
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className={styles.modalPrivacyContent}>
              <div className={styles.modalPrivacyScroll}>
                <p className={styles.modalPrivacyItem}>
                  <strong>1. 개인정보 수집 및 이용 목적</strong>
                  <br />
                  사회복지사 자격 취득 상담 진행, 문의사항 응대
                  <br />
                  개인정보는 상담 서비스 제공을 위한 목적으로만 수집 및
                  이용되며, 동의 없이 제3자에게 제공되지 않습니다
                </p>
                <p className={styles.modalPrivacyItem}>
                  <strong>2. 수집 및 이용하는 개인정보 항목</strong>
                  <br />
                  필수 - 이름, 연락처(휴대전화번호), 희망과정, 취득사유, 맘카페 이름<br/>
                  
                </p>
                <p className={styles.modalPrivacyItem}>
                  <strong>3. 보유 및 이용 기간</strong>
                  <br />
                  법령이 정하는 경우를 제외하고는 수집일로부터 1년 또는 동의
                  철회 시까지 보유 및 이용합니다.
                </p>
                <p className={styles.modalPrivacyItem}>
                  <strong>4. 동의 거부 권리</strong>
                  <br />
                  신청자는 동의를 거부할 권리가 있습니다. 단, 동의를 거부하는
                  경우 상담 서비스 이용이 제한됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function StepFlowPage() {
  const [clickSource, setClickSource] = useState<string>("");

  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
            }}
          >
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <ClickSourceHandler onSourceChange={setClickSource} />
      <StepFlowContent clickSource={clickSource} />
    </Suspense>
  );
}
