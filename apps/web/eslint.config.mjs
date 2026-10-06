import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';
export default [{ignores:['dist/**','.next/**']},{files:['**/*.ts','**/*.tsx'],languageOptions:{parser},plugins:{'@typescript-eslint':plugin},rules:{'@typescript-eslint/no-explicit-any':'error','@typescript-eslint/no-unused-vars':['warn',{argsIgnorePattern:'^_'}]}}];