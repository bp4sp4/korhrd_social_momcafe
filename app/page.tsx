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

const COURSE_OPTIONS = [
  "사회복지사",
  "아동학사",
  "평생교육사",
  "편입/대학원",
  "건강가정사",
  "청소년지도사",
  "보육교사",
  "심리상담사",
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
  const [customCourse, setCustomCourse] = useState("");

  const selectedCerts = formData.hope_course
    ? formData.hope_course.split(", ").filter(Boolean)
    : [];

  const toggleCert = (cert: string) => {
    const updated = selectedCerts.includes(cert)
      ? selectedCerts.filter((c) => c !== cert)
      : [...selectedCerts, cert];
    setFormData({ ...formData, hope_course: updated.join(", ") });
  };

  const toggleAll = () => {
    const allSelected = COURSE_OPTIONS.every((o) => selectedCerts.includes(o));
    if (allSelected) {
      setFormData({ ...formData, hope_course: "" });
    } else {
      setFormData({ ...formData, hope_course: COURSE_OPTIONS.join(", ") });
    }
  };

  const handleCustomCourseChange = (value: string) => {
    setCustomCourse(value);
    const updated = selectedCerts.filter((c) => !c.startsWith("직접입력:"));
    if (value.trim()) {
      setFormData({ ...formData, hope_course: [...updated, `직접입력:${value.trim()}`].join(", ") });
    } else {
      setFormData({ ...formData, hope_course: updated.join(", ") });
    }
  };

  const deselectAll = () => {
    setFormData({ ...formData, hope_course: "" });
    setCustomCourse("");
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
                    무료 상담신청
                  </p>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>1</div> 1:1 맞춤 안내
                  </div>
                  <div className={styles.infoDesc}>
                    개인별 상황에 맞춰 조율 가능

                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>2</div> 온라인 수업
                  </div>
                  <div className={styles.infoDesc}>
                    모든 수업은 100% 온라인으로 진행
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoTitle}>
                    <div className={styles.infoNumber}>3</div> 수업료 지원 혜택
                  </div>
                  <div className={styles.infoDesc}>
                   상담 완료 후 수강료 지원 혜택

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

      {/* 희망과정 선택 모달 */}
      {showCertModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCertModal(false)}>
          <div className={styles.certModalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.certModalHeader}>
              <h3 className={styles.certModalTitle}>희망과정 선택</h3>
              <button className={styles.certModalCloseButton} onClick={() => setShowCertModal(false)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.certModalScrollBody}>
              <p className={styles.certModalSubtitle}>복수 선택이 가능합니다</p>

              <div className={styles.courseOptionList}>
                {COURSE_OPTIONS.map((opt) => {
                  const isSelected = selectedCerts.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleCert(opt)}
                      className={`${styles.courseOption} ${isSelected ? styles.courseOptionSelected : ""}`}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13L9 17L19 7" stroke="#4c85ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className={styles.customCourseSection}>
                <label className={styles.customCourseLabel}>직접 입력</label>
                <input
                  type="text"
                  className={styles.customCourseInput}
                  placeholder="원하는 과정을 직접 입력해주세요"
                  value={customCourse}
                  onChange={(e) => handleCustomCourseChange(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.certModalFooter}>
              <button className={styles.certModalConfirmButton} onClick={() => setShowCertModal(false)}>
                선택 완료
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
