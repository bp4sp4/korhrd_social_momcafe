"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
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
      console.log("[referrer]", referrer);
      const matched = CAFE_CONFIG.find(
        (cafe) =>
          referrer.includes(`cafe.naver.com/${cafe.id}`) ||
          referrer.includes(`/cafes/${cafe.id}`) ||
          (cafe.numericId && referrer.includes(`cafes/${cafe.numericId}`)),
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

const TIME_OPTIONS = ["9:00~12:30", "13:30~15:00", "15:00~18:00"];

function StepFlowContent({ clickSource }: { clickSource: string }) {
  const [step, setStep] = useState(2);
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
  // 2026-11-25 동의를 개인정보처리방침 하나로 통합(그 안에 「개인정보 수집 · 이용 동의」 — 홍보 · 광고성 정보 제공 목적 포함) — 신청하면 광고 수신 동의도 기록
  const marketingAgreed = privacyAgreed;
  const [quickConsult, setQuickConsult] = useState(false); // (선택) 빠른 상담
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]); // 상담 선호 시간
  const [timeMemo, setTimeMemo] = useState(""); // 상담 시간 관련 메모

  const togglePreferredTime = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
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
            : "맘카페",
          fast_consultation: quickConsult,
          preferred_times: preferredTimes,
          consult_time_memo: timeMemo || null,
          marketingAgreed,
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
    formData.education.length > 0 &&
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
            src="/hanpyeong-education-logo.png"
            alt="한평생원격교육원"
            className={styles.logo}
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
            className={`${styles.stepWrapper} ${styles.formBody}`}
          >
            <h1 className={styles.formHeading}>무료 학습 상담 신청</h1>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="form-name">
                이름 <span className={styles.required}>*</span>
              </label>
              <input
                id="form-name"
                type="text"
                placeholder="이름을 입력해주세요"
                className={styles.inputField}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="form-contact">
                연락처 <span className={styles.required}>*</span>
              </label>
              <input
                id="form-contact"
                type="tel"
                placeholder="010-0000-0000"
                className={styles.inputField}
                value={formData.contact}
                onChange={(e) => {
                  const formatted = formatContact(e.target.value);
                  setFormData({ ...formData, contact: formatted });
                  validateContact(formatted);
                }}
              />
              {contactError && <p className={styles.errorMessage}>{contactError}</p>}
            </div>

            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.inputLabelCol}`}>
                <span className={styles.inputLabelMain}>
                  최종학력 <span className={styles.required}>*</span>
                </span>
                <span className={styles.inputLabelSub}>최종학력마다 과정이 달라져요!</span>
              </label>
              <div className={`${styles.choiceGrid} ${styles.educationChoices}`} role="radiogroup" aria-label="최종학력">
                {["고졸", "전문대졸", "대학교 중퇴", "4년제 대졸", "대학원생 이상"].map((option) => (
                  <label key={option} className={`${styles.choiceBox} ${formData.education === option ? styles.choiceBoxSelected : ""}`}>
                    <input type="radio" name="education" value={option} checked={formData.education === option} onChange={() => setFormData({ ...formData, education: option })} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                희망과정 <span className={styles.required}>*</span>
              </label>
              <div className={`${styles.choiceGrid} ${styles.courseChoices}`} role="radiogroup" aria-label="희망과정">
                {["사회복지사", "아동학사", "기타"].map((option) => (
                  <label key={option} className={`${styles.choiceBox} ${formData.hope_course === option ? styles.choiceBoxSelected : ""}`}>
                    <input type="radio" name="hope_course" value={option} checked={formData.hope_course === option} onChange={() => setFormData({ ...formData, hope_course: option })} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.inputLabelCol}`}>
                <span className={styles.inputLabelMain}>
                  취득사유가 어떻게 되시나요?{" "}
                  <span className={styles.required}>*</span>
                </span>
                <span className={styles.inputLabelSub}>복수선택 가능</span>
              </label>
              <div className={styles.reasonCheckGroup}>
                {["즉시취업", "이직", "미래준비", "취미"].map((opt) => {
                  const selected = formData.reason
                    ? formData.reason.split(", ").filter(Boolean).includes(opt)
                    : false;
                  return (
                    <label
                      key={opt}
                      className={`${styles.reasonCheckItem} ${selected ? styles.reasonCheckItemSelected : ""}`}
                    >
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
                          setFormData({
                            ...formData,
                            reason: updated.join(", "),
                          });
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.inputLabelCol}`}>
                <span className={styles.inputLabelMain}>
                  활동하고 계신 맘카페를 적어주세요{" "}
                  <span className={styles.required}>*</span>
                </span>
                <span className={styles.inputLabelSub}>제휴여부 확인</span>
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

            {/* (선택) 빠른 상담 + 상담 선호 시간 */}
            <div className={styles.inputGroup}>
              <div className={styles.quickConsultSection}>
                {/* (선택) 빠른 상담을 원합니다. */}
                <div className={styles.quickConsultBlock}>
                  <div className={styles.quickConsultHeader}>
                    <span className={styles.quickConsultTitle}>
                      빠른 상담을 원합니다.
                    </span>
                    <button
                      type="button"
                      className={`${styles.quickConsultCheck} ${quickConsult ? styles.quickConsultCheckOn : ""}`}
                      onClick={() => setQuickConsult((prev) => !prev)}
                      aria-pressed={quickConsult}
                      aria-label="빠른 상담 원함"
                    >
                      {quickConsult && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className={styles.quickConsultDesc}>
                    영업시간 9:00~18:00 사이 연락 드립니다.
                  </p>
                </div>

                {/* (선택) 상담이 편하신 시간을 알려주세요. */}
                <div className={styles.preferTimeBlock}>
                  {/* 상담 선호 시간 */}
                  <div className={styles.preferTimeGroup}>
                    <span className={styles.quickConsultTitle}>
                      상담이 편하신 시간대를 알려주세요.
                    </span>
                    <div className={styles.preferLabelWrap}>
                      <span className={styles.preferLabel}>상담 선호 시간</span>
                      <span className={styles.preferSubLabel}>
                        복수선택 가능
                      </span>
                    </div>
                    <div className={styles.preferTimeGrid}>
                      {TIME_OPTIONS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`${styles.preferTimeSlot} ${preferredTimes.includes(time) ? styles.preferTimeSlotOn : ""}`}
                          onClick={() => togglePreferredTime(time)}
                          aria-pressed={preferredTimes.includes(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 상담 시간 관련 메모 */}
                  <div className={styles.preferMemoGroup}>
                    <div className={styles.preferLabelWrap}>
                      <span className={styles.preferLabel}>
                        상담 시간 관련 메모
                      </span>
                      <span className={styles.preferMemoSubLabel}>
                        편하신 요일, 시간 관련 메모를 남겨주시면 최대한 맞춰서
                        연락드려요.
                      </span>
                    </div>
                    <div className={styles.memoInputWrap}>
                      <input
                        type="text"
                        maxLength={25}
                        placeholder="월/수/금 오전, 화/목 오후 선호"
                        className={styles.preferMemoInput}
                        value={timeMemo}
                        onChange={(e) => setTimeMemo(e.target.value)}
                      />
                      <span className={styles.memoCounter}>{timeMemo.length}/25</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.consentGroup}`}>
              <div className={styles.privacyRow}>
                <span className={styles.privacyText}>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className={styles.privacyLink}
                  >
                    개인정보처리방침
                  </button>{" "}
                  <span className={styles.privacyAgree}>동의</span>{" "}
                  <span className={styles.privacyRequired}>(필수)</span>
                </span>
                <button
                  type="button"
                  className={`${styles.quickConsultCheck} ${privacyAgreed ? styles.quickConsultCheckOn : ""}`}
                  onClick={() => setPrivacyAgreed((prev) => !prev)}
                  aria-pressed={privacyAgreed}
                  aria-label="개인정보처리방침 동의 (필수)"
                >
                  {privacyAgreed && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
                  필수 - 이름, 연락처(휴대전화번호), 최종학력, 희망과정,
                  취득사유, 맘카페 이름
                  <br />
                  선택 - 빠른 상담 여부, 상담 선호 시간, 상담 시간 메모
                  <br />
                </p>
                <p className={styles.modalPrivacyItem}>
                  <strong>3. 동의 거부 권리</strong>
                  <br />
                  신청자는 동의를 거부할 권리가 있습니다. 단, 동의를 거부하는
                  경우 상담 서비스 이용이 제한됩니다.
                </p>
                <p className={styles.modalPrivacyItem}>
                  <strong>4. 개인정보 수집 · 이용 동의</strong>
                </p>
                <p className={styles.modalPrivacyItem}>
                  회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
                </p>
                <p className={styles.modalPrivacyItem}>
                  학점은행제 교육과정 이용에 필요한 사항 제공 및 안내
                  <br />
                  신규 서비스 및 연수과정 홍보, 이벤트 및 광고성 정보 제공 및 참여기회 제공
                </p>
                <p className={styles.modalPrivacyItem}>
                  수집하는 개인 정보 항목 : 이름, 연락처, 관심과정
                  <br />
                  보유 및 이용기간 : 신청일 기준 3년 이내
                  <br />
                  보존근거 : 소비자보호에 관한 법률 시행령 제6조 제3항
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
