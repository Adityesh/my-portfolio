import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import {Send} from '../../icons/icons'

const validationSchema = yup.object().shape({
    name: yup.string().required("Name cannot be empty"),
    email: yup.string().email("Not a valid email").required("Email cannot be empty"),
    message: yup.string().required("Message cannot be empty")
})


const Contact = () => {

    const handleSubmit = ({ email, name, message }) => {
        console.log(email, name, message);
    }


    return (
        <div className="contact-section">
            <h1 className="contact-header">Contact Me</h1>
            <h2 style={{textAlign : 'center', paddingBottom : '20px'}}>Let's work together.</h2>
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    message: ''
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleSubmit(values)}
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
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea id="message" name="message" value={values.message} onChange={handleChange('message')} onBlur={handleBlur('message')}/>
                                <span className="form-error">{touched.message && errors.message}</span>
                            </p>
                            <button type="submit" className="form-submit">
                                Submit <Send />
                        </button>
                        </form>
                    )
                }}

            </Formik>
        </div>
    )

};


export default Contact;