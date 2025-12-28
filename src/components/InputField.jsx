import React from 'react';
import PropTypes from 'prop-types';

const InputField = ({ label, value, onChange, type = "text", prefix = "", suffix = "", placeholder = "", onKeyDown }) => (
  <div className="mb-4">
    <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  placeholder: PropTypes.string,
  onKeyDown: PropTypes.func,
};

export default InputField;
