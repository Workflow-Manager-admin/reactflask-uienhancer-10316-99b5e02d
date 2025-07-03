import React, { useState } from "react";
import "./DynamicForm.css";

// Sample form schema
const sampleSchema = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "age", label: "Age", type: "number", required: false },
];

// PUBLIC_INTERFACE
/**
 * Dynamic form component.
 * Renders form fields from schema, validates inputs.
 */
function DynamicForm({ schema = sampleSchema, onSubmit, submitLabel = "Submit" }) {
  const initialState = {};
  schema.forEach((f) => (initialState[f.name] = ""));
  const [formValues, setFormValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  // PUBLIC_INTERFACE
  function validate() {
    let errs = {};
    schema.forEach((field) => {
      if (field.required && !formValues[field.name]) {
        errs[field.name] = `${field.label} is required.`;
      }
      // Simple email validation
      if (field.type === "email" && formValues[field.name] && !/\S+@\S+\.\S+/.test(formValues[field.name])) {
        errs[field.name] = "Invalid email address.";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    if (validate()) {
      try {
        // Simulate submit to backend REST API
        if (onSubmit) {
          await onSubmit(formValues);
        }
        setStatus("Form submitted successfully.");
        setFormValues(initialState);
      } catch (err) {
        setStatus("Submission failed.");
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleChange(e) {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  return (
    <section className="dynamic-form">
      <h2>Dynamic Form Example</h2>
      <form onSubmit={handleSubmit} data-testid="dynamic-form">
        {schema.map((field) => (
          <div className="form-group" key={field.name}>
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
              <input
                type={field.type}
                name={field.name}
                value={formValues[field.name]}
                onChange={handleChange}
                required={field.required}
                autoComplete="off"
                className={errors[field.name] ? "input-error" : ""}
              />
            </label>
            {errors[field.name] && (
              <div className="error-message">{errors[field.name]}</div>
            )}
          </div>
        ))}
        <button type="submit">{submitLabel}</button>
        {status && <div className="form-status">{status}</div>}
      </form>
    </section>
  );
}

export default DynamicForm;
