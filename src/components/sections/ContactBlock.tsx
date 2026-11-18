"use client";

import { Fragment, useState, type FormEvent } from "react";
import {
  SITE_CONFIG,
  CONTACT_CONTENT,
  PROFILE_PORTRAIT_MEDIA,
} from "@/data/portfolio";
import {
  SignatureDrawSvg,
  BarcodeSvg,
} from "@/components/svg/BrandGraphics";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { WordReveal } from "@/components/motion/WordReveal";
import { DrawSvg } from "@/components/motion/DrawSvg";
import { Marquee } from "@/components/motion/Marquee";
import {
  BlockAnim,
  InnerCanvasBox,
} from "@/components/motion/MicroPrimitives";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const INITIAL_VALUES: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactBlock() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (candidate: ContactFormValues): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};
    if (!candidate.name.trim()) {
      nextErrors.name = "Please share your name.";
    }
    if (!candidate.email.trim()) {
      nextErrors.email = "Please enter an email address.";
    } else if (!EMAIL_PATTERN.test(candidate.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!candidate.message.trim()) {
      nextErrors.message = "Please add a short note or question.";
    }
    return nextErrors;
  };

  const handleChange = (field: keyof ContactFormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setSubmitted(false);
  };

  const mailtoHref = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(
    `Portfolio Inquiry from ${values.name.trim() || "Visitor"}`
  )}&body=${encodeURIComponent(
    `Hi Tuan Anh,\n\n${values.message.trim()}\n\n—\nFrom: ${values.name.trim()}\nReply-to: ${values.email.trim()}`
  )}`;

  return (
    <section className="contactBlock">
      <div className="contentWrapper">
        <div className="intro">
          <SplitTitle
            variant="huge"
            tag="h1"
            lines={[CONTACT_CONTENT.title]}
            immediate
            delay={0.1}
          />
          <div className="tags">
            <Marquee items={CONTACT_CONTENT.tags} scrollSpeed={0.3} />
          </div>
        </div>

        <div className="cols">
          <div className="col">
            <WordReveal
              text={CONTACT_CONTENT.introCopy}
              immediate
              delay={0.35}
              tag="p"
              className="text"
            />
            <InnerCanvasBox
              imageSrc={PROFILE_PORTRAIT_MEDIA.imageSrc}
              respImageSrc={PROFILE_PORTRAIT_MEDIA.respImageSrc}
              alt={PROFILE_PORTRAIT_MEDIA.alt}
              mouseTrigger
            />
            <div className="drawTextContainer">
              <DrawSvg triggerOnScroll delay={0.1}>
                <SignatureDrawSvg variant="birdCallout" />
              </DrawSvg>
            </div>
          </div>

          <div className="col">
            <p className="address">
              {SITE_CONFIG.addressLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </p>
            <div
              className="contactLinks"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.45em",
                marginTop: "0.75em",
                marginBottom: "1em",
                maxWidth: "100%",
              }}
            >
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="textLink"
                style={{ maxWidth: "100%", overflowWrap: "anywhere" }}
              >
                {SITE_CONFIG.email}
              </a>
              <div
                className="socialQuickLinks"
                style={{
                  display: "flex",
                  gap: "1em",
                  flexWrap: "wrap",
                }}
              >
                {SITE_CONFIG.socials
                  .filter((social) => social.platform !== "email")
                  .map((social) => (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="textLink"
                    >
                      {social.label}
                    </a>
                  ))}
              </div>
            </div>
            <div className="barCode">
              <a
                href={SITE_CONFIG.barcodeHref}
                aria-label={`Email ${SITE_CONFIG.barcodeLabel}`}
              >
                <Marquee direction="right" speed={100} scrollSpeed={10}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      paddingRight: "0.5vw",
                    }}
                  >
                    <BarcodeSvg />
                  </span>
                </Marquee>
                <span className="label">{SITE_CONFIG.barcodeLabel}</span>
              </a>
            </div>
          </div>

          <div className="col">
            <div className={`formWrapper${submitted ? " submitted" : ""}`}>
              <form onSubmit={handleSubmit} noValidate>
                {CONTACT_CONTENT.questions.map((field) => (
                  <div key={field.id} className="field">
                    <label htmlFor={`contact-${field.id}`} className="question">
                      {field.question}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={`contact-${field.id}`}
                        name={field.id}
                        rows={3}
                        placeholder={field.placeholder}
                        value={values[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        aria-invalid={Boolean(errors[field.id])}
                      />
                    ) : (
                      <input
                        id={`contact-${field.id}`}
                        name={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={values[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        aria-invalid={Boolean(errors[field.id])}
                      />
                    )}
                    {errors[field.id] ? (
                      <span className="fieldError" role="alert">
                        {errors[field.id]}
                      </span>
                    ) : null}
                  </div>
                ))}

                <div className="submitField">
                  <button
                    type="submit"
                    className="button secondary wpcf7-submit"
                  >
                    {CONTACT_CONTENT.submitLabel}
                  </button>
                </div>
              </form>

              <div className="successMessage" aria-live="polite">
                <h3>Message in Flight</h3>
                <p>{CONTACT_CONTENT.successMessage}</p>
                <div className="successActions">
                  <a href={mailtoHref} className="button secondary small">
                    Send via Email App &rarr;
                  </a>
                  <button
                    type="button"
                    className="textLink"
                    onClick={handleReset}
                  >
                    Send another message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col">
            <BlockAnim variant={1} />
            <div className="location">
              <span>{SITE_CONFIG.locationLabel}</span>
              <span>{SITE_CONFIG.coordinates}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactBlock;
