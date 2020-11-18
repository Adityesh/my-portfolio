import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import emailjs from 'emailjs-com';
import { useSnackbar } from 'react-simple-snackbar';

const validationSchema = yup.object().shape({
    name: yup.string().required("*Name cannot be empty"),
    email: yup.string().email("*Not a valid email").required("*Email cannot be empty"),
    subject : yup.string().required('*Subject cannot be empty'),
    message: yup.string().required("*Message cannot be empty")
})


const Contact = (props) => {

    const [openSnackbar, closeSnackbar] = useSnackbar({
        position: 'bottom-center',
        style: {
          backgroundColor: 'black',
          border: '2px solid black',
          color: 'white',
          fontFamily: 'Menlo, monospace',
          fontSize: '20px',
          textAlign: 'center',
        },
        closeStyle: {
          color: 'lightcoral',
          fontSize: '16px',
        }
    });
    const handleSubmit = async ({email, name, message, subject},resetForm) => {
        try {
            const result = await emailjs.send('service_ed84brs', 'template_ava5qvp' ,{
                subject,
                name,
                email,
                message,
                }, 'user_FFesXyDJ3SmB4f6fKeOu6');
                openSnackbar('Email sent successfully!',[2000])
            resetForm();
        } catch(err) {
            console.log(err);
            openSnackbar('Error sending email.',[2000])
        }
    }


    return (
        <div className="contact-section" ref={props.reference}>
            <h1 className="contact-header contact">Contact Me</h1>
            <h2 style={{textAlign : 'center', paddingBottom : '20px'}}>Let's work together.</h2>
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    subject : '',
                    message: ''
                }}
                validationSchema={validationSchema}
                onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
            >

                {({ errors, values, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                    return (
                        <form onSubmit={handleSubmit} className="contact-form">
                            <p>
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" name="email" id="email" value={values.email} onChange={handleChange('email')} onBlur={handleBlur('email')}/>
                                <span className="form-error">{touched.email && errors.email}</span>
                            </p>
                            <p>
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text" name="name" id="name" value={values.name} onChange={handleChange('name')} onBlur={handleBlur('name')}/>
                                <span className="form-error">{touched.name && errors.name}</span>
                            </p>
                            <p>
                                <label htmlFor="subject" className="form-label">Subject</label>
                                <input type="text" name="subject" id="subject" value={values.subject} onChange={handleChange('subject')} onBlur={handleBlur('subject')}/>
                                <span className="form-error">{touched.subject && errors.subject}</span>
                            </p>
                            <p>
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea id="message" name="message" value={values.message} onChange={handleChange('message')} onBlur={handleBlur('message')}/>
                                <span className="form-error">{touched.message && errors.message}</span>
                            </p>
                            <input type="submit" className="form-submit" value="Submit"></input>
                                
                        </form>
                    )
                }}

            </Formik>

        </div>
    )

};


export default Contact;