import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from '../common/Snackbar';
import { Send } from '../../icons/icons';
import './contact.css';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactProps {
  reference: React.RefObject<HTMLDivElement>;
}

const Contact: React.FC<ContactProps> = ({ reference }) => {
  const [isSending, setIsSending] = useState(false);

  const [openSnackbar] = useSnackbar({
    position: 'bottom-center',
    style: {
      backgroundColor: '#11141d',
      border: '1px solid #38bdf8',
      color: '#f1f5f9',
      fontFamily: 'var(--font-mono)',
      fontSize: '14px',
      textAlign: 'center',
    },
    closeStyle: {
      color: '#f43f5e',
      fontSize: '16px',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (_data: FormValues) => {
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      openSnackbar('✓ Message dispatched successfully! Status: 200 OK', 3000);
      reset();
    } catch (err) {
      console.error(err);
      openSnackbar('[!] Error transmitting message. Please try again.', 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="contact-block" ref={reference} id="contact">
      <div className="terminal-prompt-line">
        <span className="prompt-host">adityesh@portfolio</span>
        <span className="prompt-symbol">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-symbol">$</span>
        <span className="prompt-cmd">./send-message.sh --interactive</span>
      </div>

      <div className="contact-output">
        <h2 className="contact-header-text">// Interactive Message Dispatcher</h2>
        <p className="contact-desc">
          Have an engineering opportunity, technical inquiry, or interested in building something together?
          Specify your parameters below to dispatch a message directly.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="terminal-contact-form" noValidate>
          <div className="form-field">
            <label htmlFor="name" className="field-label">
              <span className="param-flag">--name</span> string:
            </label>
            <input
              type="text"
              id="name"
              className="terminal-input"
              placeholder="e.g. Alex Morgan"
              {...register('name', { required: '*Name cannot be empty' })}
            />
            {errors.name && <span className="terminal-error-msg">[!] {errors.name.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="email" className="field-label">
              <span className="param-flag">--email</span> string:
            </label>
            <input
              type="email"
              id="email"
              className="terminal-input"
              placeholder="e.g. alex@company.com"
              {...register('email', {
                required: '*Email cannot be empty',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '*Not a valid email address',
                },
              })}
            />
            {errors.email && <span className="terminal-error-msg">[!] {errors.email.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="subject" className="field-label">
              <span className="param-flag">--subject</span> string:
            </label>
            <input
              type="text"
              id="subject"
              className="terminal-input"
              placeholder="e.g. Full Stack Role / Project Collaboration"
              {...register('subject', { required: '*Subject cannot be empty' })}
            />
            {errors.subject && <span className="terminal-error-msg">[!] {errors.subject.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="message" className="field-label">
              <span className="param-flag">--body</span> text:
            </label>
            <textarea
              id="message"
              className="terminal-textarea"
              placeholder="Type your message payload here..."
              {...register('message', { required: '*Message cannot be empty' })}
            />
            {errors.message && <span className="terminal-error-msg">[!] {errors.message.message}</span>}
          </div>

          <div className="form-submit-row">
            <button type="submit" className="terminal-submit-btn" disabled={isSending}>
              <Send /> {isSending ? 'Transmitting...' : '↵ Execute / Send'}
            </button>
            <span className="submit-hint">exit status: 0 | payload verified</span>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
