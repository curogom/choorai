import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  BUTTON_LESSON_LAST_STAGE,
  BUTTON_LESSON_MAX_FIELD_LENGTH,
  BUTTON_LESSON_STARTER,
  BUTTON_LESSON_STORAGE_KEY,
  BUTTON_LESSON_UNDO_STORAGE_KEY,
  createButtonLessonUndoSnapshot,
  prepareButtonLessonPreview,
  readButtonLessonState,
  readButtonLessonUndoSnapshot,
} from '../lib/learning/buttonLessonSandbox.js';
import { mergeThreeWayFields, sameStoredValue } from '../lib/learning/threeWayMerge';

type Locale = 'ko' | 'en';
type Field = 'html' | 'css' | 'javascript';
type Draft = { html: string; css: string; javascript: string };
type Check = 'changed' | 'unchanged' | null;
type Diagnostic = { file: Field; line: number; column: number; code: string; feature?: string };
type LessonState = Draft & { stage: number; check: Check; revision: number; unchangedRevision: number | null; repairRevision: number | null };

const copy = {
  en: {
    title: 'Make a button change a message',
    intro: 'A short, hands-on lesson in real HTML, CSS, and JavaScript. Edit each file, run it in the isolated preview, and check what you actually observe.',
    differenceTitle: 'A different kind of lesson',
    difference: 'This lesson runs your HTML, CSS, and JavaScript in a sandboxed iframe. It is separate from the Choorai Steps memo practice, which uses a small educational rule language rather than JavaScript.',
    starter: '1. Start with the three files',
    starterBody: 'The HTML button and the JavaScript selector intentionally use different IDs. Preview the starter, then use the hint to repair the selector.',
    html: 'HTML', css: 'CSS', javascript: 'JavaScript',
    edit: 'Edit the real code below. HTML describes the button and message; CSS styles them; JavaScript connects a click to a text change.',
    run: 'Run preview', rerun: 'Run preview again',
    previewTitle: 'Sandboxed preview',
    notRun: 'Run the preview to see your page here.',
    previewSafety: 'This preview accepts only a small HTML and JavaScript subset, parses it, and rebuilds a normalized page. It is not a safe sandbox for arbitrary JavaScript. Links, forms, scripts outside the supported click handler, frames, embedded resources, navigation, and network APIs are unsupported. The rebuilt page runs in an opaque-origin iframe with sandbox="allow-scripts" only and a restrictive Content Security Policy; it cannot access this page’s DOM or storage and sends no messages to the page.',
    expected: '2. Check the expected behavior',
    expectedBody: (message: string) => message
      ? `Click the button in the preview. The message should change to “${message}”.`
      : 'Run the current code, then click the button in the preview to check the message.',
    changed: 'I clicked it; the message changed', unchanged: 'I clicked it; it did not change',
    selfReport: 'This is a manual self-check. Your choice records what you observed; it does not execute or automatically verify your code.',
    codeHint: 'Quick code hint · source text only',
    missingButton: (missing: string, present: string) => `The JavaScript looks for #${missing}, but the HTML button has #${present}. querySelector returns null, so addEventListener cannot be attached. Change the selector to match the button ID.`,
    missingMessage: (missing: string, present: string) => `The JavaScript looks for #${missing}, but the message paragraph has #${present}. querySelector returns null, so textContent cannot be updated. Change the selector to match the paragraph ID.`,
    noMismatch: 'Both selectors match the supported HTML structure. Click the button in the preview to check its behavior.',
    previewRequired: 'Run the current supported code before using this hint or recording an observation.',
    repair: '3. Repair and check again',
    repairBody: 'Make the button selector in JavaScript match the button ID in HTML. Run the preview again, click the button, and check the message yourself.',
    repairConfirm: 'I repaired it and observed the message change',
    repairNeedRun: 'Fix any code error shown above, then run the current code before recording this check.',
    repairNeedFresh: 'After reporting no change, edit the code and run a fresh preview before checking again.',
    repairNeedChanged: 'Use the current preview to report that the message changed before confirming the repair.',
    variation: '4. Try a tiny variation',
    variationBody: 'Change the sentence assigned to message.textContent in JavaScript. Run the preview again and click the button to see your own sentence.',
    variationConfirm: 'I saw my new sentence in the preview',
    variationNeedEditRun: 'Change a code field and run the preview again after confirming the repair.',
    resume: '5. Revisit or resume',
    resumeBody: 'Your code and lesson progress are saved only in this browser. The saved step is a checkpoint, not a code score. Reopen this page to resume; run the preview again after you return.',
    stage: (stage: number) => `Lesson step saved: ${stage} of ${BUTTON_LESSON_LAST_STAGE}`,
    storageReady: 'Draft saved in this browser.',
    storageResumed: 'Resumed your saved draft from this browser.',
    storageUnavailable: 'Browser storage is unavailable. Editing and preview still work in this tab, but refreshing may discard your draft.',
    storageInvalid: 'The saved draft could not be read, so it was left untouched. You can start a fresh practice in this tab.',
    fieldLimit: 'Keep each code file under 12,000 characters.',
    manual: 'Manual self-check',
    fileNames: { html: 'HTML', css: 'CSS', javascript: 'JavaScript' },
    errorPosition: (file: string, line: number, column: number) => `${file}, line ${line}, column ${column}`,
    errorTitle: 'This draft could not run. Use the file and line below to repair it.',
    errorMessage: (code: string, feature: string) => ({
      'html-missing-main-close': 'The main section is missing its closing tag.',
      'html-unsupported-structure': 'This HTML does not match the lesson’s supported structure.',
      'css-unsupported-calc': 'calc() is outside this lesson’s small CSS subset.',
      'css-unsupported-value': 'This CSS selector or value is outside the lesson’s supported subset.',
      'javascript-missing-string-quote': 'The sentence string is missing its closing quotation mark.',
      'javascript-unsupported-feature': `${feature} is outside this lesson’s supported JavaScript subset.`,
      'javascript-unsupported-structure': 'This JavaScript does not match the supported two selectors and click handler.',
    }[code] || 'This code does not match the lesson’s supported subset.'),
    errorHint: (code: string) => ({
      'html-missing-main-close': 'Step 1: Keep the heading, button, and message paragraph in that order. Step 2: Add the closing main tag after the paragraph.',
      'html-unsupported-structure': 'Step 1: Use one main, then h1, button, and p. Step 2: Keep attributes to main class, button id/type, and message p id. Text must be plain.',
      'css-unsupported-calc': 'Step 1: Find calc() on this line. Step 2: Replace that value with a simple number or length, such as 1rem. Step 3: Run the preview again.',
      'css-unsupported-value': 'Step 1: Use simple body, main, h1, button, p, or class selectors. Step 2: Use plain values without functions, URLs, or quoted text.',
      'javascript-missing-string-quote': 'Step 1: Find the message.textContent line. Step 2: Add the same quotation mark before the semicolon to close your sentence. Step 3: Run again.',
      'javascript-unsupported-feature': 'Keep the two querySelector lines and one click handler. Edit only the selector text or the sentence assigned to message.textContent.',
      'javascript-unsupported-structure': 'Step 1: Keep two const querySelector bindings named button and message. Step 2: Keep one button click handler. Step 3: Assign one plain quoted sentence to message.textContent.',
    }[code] || 'Compare this file with the starter and change only the part described above, then run again.'),
    errorExample: (code: string) => ({
      'html-missing-main-close': '</main>',
      'css-unsupported-calc': 'margin: 1rem;',
      'javascript-missing-string-quote': 'message.textContent = "Your own sentence.";',
    }[code] || ''),
    locateLine: 'Go to the reported line',
    showHint: 'Show a step-by-step hint',
    hideHint: 'Hide the hint',
    locatePreview: 'Preview is ready. Go to the preview to try the button.',
    previewReady: 'The preview is ready. The code shown above was accepted by the lesson’s limited parser.',
    previewAnchor: 'Go to preview',
    currentDraft: 'Current draft status',
    currentNotRun: 'Not run yet. Run the preview to check this draft.',
    currentEdited: 'You changed this draft in this visit. Run the preview to check the current code.',
    currentResumed: 'This saved draft has not been previewed in this visit. Run it to check the current code.',
    currentFailed: 'The current draft did not run. Use the file, line, and repair hint above.',
    currentReady: 'Current draft ran. The behavior below is still a manual self-check.',
    pastProgress: (stage: number) => `Earlier lesson progress: ${stage} of ${BUTTON_LESSON_LAST_STAGE}. This saved checkpoint does not confirm the current code.`,
    resetDialogTitle: 'Start this lesson over?',
    resetDialogBody: 'This clears the saved HTML, CSS, JavaScript draft and lesson progress in this browser. Previewing and checking will not remove its one-time undo. Editing, using Undo, or confirming another reset ends or replaces it.',
    resetCancel: 'Cancel and keep my draft',
    resetConfirm: 'Clear draft and start over',
    resetUndo: 'Undo the last reset',
    resetUndone: 'Restored the exact saved draft and lesson step. Run the preview again to check it.',
    resetDone: 'Started a fresh lesson. The previous draft and step can be restored once with Undo. Previewing or checking will not remove it; editing or confirming another reset will.',
    resetEmptyDone: 'Started a fresh lesson. There was no earlier draft or progress to restore.',
    resetStorageIssue: 'Started a fresh lesson in this tab, but browser storage could not save or clear the draft. Undo is available only in this tab; refreshing may restore the prior draft and lose the undo.',
    resetUndoStorageIssue: 'The draft was restored in this tab, but browser storage could not update. Run the preview again; a refresh may restore the stored version.',
    reset: 'Start this lesson over',
  },
  ko: {
    title: '버튼을 눌러 메시지 바꾸기',
    intro: '실제 HTML, CSS, JavaScript를 직접 고쳐 실행하는 짧은 실습입니다. 코드를 편집하고 격리된 미리보기에서 직접 동작을 확인하세요.',
    differenceTitle: '기존 실습과 다른 수업',
    difference: '이 수업은 HTML, CSS, JavaScript를 격리된 iframe에서 실행합니다. 메모 실습의 Choorai Steps 교육용 규칙 문법과는 별개의 수업이며, 해당 문법은 JavaScript가 아닙니다.',
    starter: '1. 세 파일의 시작 코드 살펴보기',
    starterBody: 'HTML의 버튼 ID와 JavaScript의 선택자 ID가 일부러 다릅니다. 시작 코드를 미리보기에서 실행한 다음 안내를 보고 선택자를 고쳐 보세요.',
    html: 'HTML', css: 'CSS', javascript: 'JavaScript',
    edit: '아래 실제 코드를 편집하세요. HTML은 버튼과 메시지를 만들고, CSS는 모양을 정하고, JavaScript는 클릭과 문구 변경을 연결합니다.',
    run: '미리보기 실행', rerun: '미리보기 다시 실행',
    previewTitle: '격리된 미리보기',
    notRun: '미리보기를 실행하면 여기에 페이지가 나타납니다.',
    previewSafety: '이 미리보기는 제한된 HTML·JavaScript 문법만 받아 해석한 뒤 정규화된 페이지를 다시 만듭니다. 임의 JavaScript를 안전하게 격리하는 실행 환경이 아닙니다. 링크·폼·지원된 클릭 처리기 밖의 스크립트·프레임·외부 리소스·페이지 이동·네트워크 API는 지원하지 않습니다. 정규화한 페이지는 sandbox="allow-scripts"만 허용한 불투명한 origin의 iframe과 제한적 Content Security Policy에서 실행되며, 이 페이지의 DOM·저장소에 접근하거나 페이지로 메시지를 보내지 않습니다.',
    expected: '2. 예상 동작 확인',
    expectedBody: (message: string) => message
      ? `미리보기에서 버튼을 누르세요. 메시지가 “${message}”로 바뀌어야 합니다.`
      : '현재 코드를 실행한 뒤 미리보기에서 버튼을 눌러 메시지를 확인하세요.',
    changed: '눌렀고 메시지가 바뀌었어요', unchanged: '눌렀지만 메시지가 그대로예요',
    selfReport: '수동 자가 확인입니다. 선택한 항목은 직접 관찰한 내용을 기록하며, 코드를 실행하거나 자동 검증하지 않습니다.',
    codeHint: '빠른 코드 안내 · 소스 텍스트 확인',
    missingButton: (missing: string, present: string) => `JavaScript는 #${missing}를 찾지만 HTML 버튼의 ID는 #${present}입니다. querySelector는 null을 돌려주므로 addEventListener를 연결할 수 없습니다. 선택자를 버튼 ID와 맞춰 보세요.`,
    missingMessage: (missing: string, present: string) => `JavaScript는 #${missing}를 찾지만 메시지 문단의 ID는 #${present}입니다. querySelector는 null을 돌려주므로 textContent를 바꿀 수 없습니다. 선택자를 문단 ID와 맞춰 보세요.`,
    noMismatch: '두 선택자가 지원하는 HTML 구조와 일치합니다. 미리보기에서 버튼을 눌러 동작을 확인하세요.',
    previewRequired: '현재 지원 문법 코드를 미리보기로 실행한 뒤 안내와 관찰을 기록하세요.',
    repair: '3. 고쳐서 다시 확인하기',
    repairBody: 'JavaScript의 버튼 선택자를 HTML 버튼 ID와 맞추세요. 미리보기를 다시 실행하고 버튼을 눌러 메시지가 바뀌는지 직접 확인하세요.',
    repairConfirm: '고친 뒤 메시지가 바뀌는 것을 확인했어요',
    repairNeedRun: '위에 코드 오류가 있으면 먼저 고친 뒤 미리보기를 실행하고 확인을 기록하세요.',
    repairNeedFresh: '메시지가 그대로라고 확인했다면, 코드를 고친 뒤 새 미리보기를 실행하고 다시 확인하세요.',
    repairNeedChanged: '수정을 확인하기 전에 현재 미리보기에서 메시지가 바뀌었다고 기록하세요.',
    variation: '4. 작은 변형 해 보기',
    variationBody: 'JavaScript에서 message.textContent에 대입하는 문장을 바꿔 보세요. 미리보기를 다시 실행하고 버튼을 눌러 직접 쓴 문장을 확인하세요.',
    variationConfirm: '미리보기에서 새 문장을 확인했어요',
    variationNeedEditRun: '수정 확인 뒤 코드 파일을 바꾸고 미리보기를 다시 실행하세요.',
    resume: '5. 다시 방문하거나 이어서 하기',
    resumeBody: '코드와 실습 진행 단계는 이 브라우저에만 저장됩니다. 저장된 단계는 학습 확인 기록이며 코드 점수가 아닙니다. 페이지를 다시 열면 이어서 할 수 있고, 미리보기는 돌아온 뒤 다시 실행해야 합니다.',
    stage: (stage: number) => `저장된 실습 단계: ${stage}/${BUTTON_LESSON_LAST_STAGE}`,
    storageReady: '초안을 이 브라우저에 저장했습니다.',
    storageResumed: '이 브라우저에 저장된 초안을 이어서 엽니다.',
    storageUnavailable: '브라우저 저장을 사용할 수 없습니다. 이 탭에서 편집·미리보기는 계속할 수 있지만 새로고침하면 초안이 사라질 수 있습니다.',
    storageInvalid: '저장된 초안을 읽지 못해 기존 값을 그대로 두었습니다. 이 탭에서는 새 실습을 시작할 수 있습니다.',
    fieldLimit: '각 코드 파일은 12,000자 이내로 작성하세요.',
    manual: '수동 자가 확인',
    fileNames: { html: 'HTML', css: 'CSS', javascript: 'JavaScript' },
    errorPosition: (file: string, line: number, column: number) => `${file} ${line}행 ${column}열`,
    errorTitle: '현재 초안을 실행하지 못했습니다. 아래 파일과 줄을 확인해 고쳐 보세요.',
    errorMessage: (code: string, feature: string) => ({
      'html-missing-main-close': 'main 영역을 닫는 태그가 빠졌습니다.',
      'html-unsupported-structure': 'HTML이 이 실습에서 지원하는 구조와 다릅니다.',
      'css-unsupported-calc': 'calc()는 이 실습의 제한된 CSS 문법에서 지원하지 않습니다.',
      'css-unsupported-value': 'CSS 선택자 또는 값이 이 실습의 지원 범위에 없습니다.',
      'javascript-missing-string-quote': '문자열을 닫는 따옴표가 빠졌습니다.',
      'javascript-unsupported-feature': `${feature} 기능은 이 실습의 제한된 JavaScript 문법에서 지원하지 않습니다.`,
      'javascript-unsupported-structure': 'JavaScript가 지원되는 선택자 두 개와 클릭 처리기 구조와 다릅니다.',
    }[code] || '이 코드는 실습의 제한된 문법과 맞지 않습니다.'),
    errorHint: (code: string) => ({
      'html-missing-main-close': '1단계: 제목, 버튼, 메시지 문단 순서를 유지하세요. 2단계: 문단 아래에 main 닫는 태그를 추가하세요.',
      'html-unsupported-structure': '1단계: main 하나 안에 h1, button, p를 순서대로 둡니다. 2단계: main class, button id/type, p id만 사용합니다. 태그 안 문구는 일반 텍스트로 작성하세요.',
      'css-unsupported-calc': '1단계: 이 줄에서 calc()를 찾으세요. 2단계: 해당 값을 1rem 같은 간단한 숫자나 길이로 바꿉니다. 3단계: 미리보기를 다시 실행하세요.',
      'css-unsupported-value': '1단계: body, main, h1, button, p 또는 class 선택자를 사용하세요. 2단계: 함수·URL·따옴표 없이 간단한 값을 적으세요.',
      'javascript-missing-string-quote': '1단계: message.textContent 줄을 찾으세요. 2단계: 세미콜론 앞에 문장에 사용한 것과 같은 따옴표를 추가하세요. 3단계: 다시 실행하세요.',
      'javascript-unsupported-feature': 'button과 message를 찾는 두 querySelector 줄, 클릭 처리기 하나를 유지하세요. 선택자 글자나 message.textContent의 문장만 바꿔 보세요.',
      'javascript-unsupported-structure': '1단계: button과 message 이름의 const querySelector 바인딩 두 개를 둡니다. 2단계: button 클릭 처리기 하나를 둡니다. 3단계: message.textContent에 따옴표로 감싼 문장 하나를 대입하세요.',
    }[code] || '시작 코드와 이 파일을 비교하고 위 원인으로 표시된 부분만 바꾼 뒤 다시 실행하세요.'),
    errorExample: (code: string) => ({
      'html-missing-main-close': '</main>',
      'css-unsupported-calc': 'margin: 1rem;',
      'javascript-missing-string-quote': 'message.textContent = "내 문장입니다.";',
    }[code] || ''),
    locateLine: '오류 줄로 이동',
    showHint: '단계별 힌트 보기',
    hideHint: '힌트 숨기기',
    locatePreview: '미리보기를 준비했습니다. 이동해 버튼을 눌러 보세요.',
    previewReady: '미리보기를 준비했습니다. 위 코드가 제한 문법을 통과해 표시됩니다.',
    previewAnchor: '미리보기로 이동',
    currentDraft: '현재 초안 상태',
    currentNotRun: '아직 실행하지 않았습니다. 현재 코드를 미리보기에서 확인하세요.',
    currentEdited: '마지막 실행 뒤 코드를 수정했습니다. 현재 초안을 확인하려면 다시 실행하세요.',
    currentResumed: '저장된 초안을 이번 방문에서 아직 실행하지 않았습니다. 현재 코드를 확인하려면 미리보기를 실행하세요.',
    currentFailed: '현재 초안을 실행하지 못했습니다. 위의 파일·줄·수정 힌트를 확인하세요.',
    currentReady: '현재 초안을 실행했습니다. 아래 동작 확인은 직접 관찰해 기록하세요.',
    pastProgress: (stage: number) => `이전에 저장한 실습 진행: ${stage}/${BUTTON_LESSON_LAST_STAGE}. 과거 단계 기록이며 현재 코드를 확인한 결과는 아닙니다.`,
    resetDialogTitle: '실습을 처음부터 다시 시작할까요?',
    resetDialogBody: '이 브라우저에 저장된 HTML·CSS·JavaScript 초안과 실습 진행이 지워집니다. 미리보기 실행과 확인 기록은 한 번 되돌리기를 지우지 않습니다. 초안을 수정하거나, 되돌리기를 사용하거나, 다시 초기화하면 복원 기록이 끝나거나 바뀝니다.',
    resetCancel: '취소하고 초안 보존',
    resetConfirm: '초안 지우고 처음부터 시작',
    resetUndo: '마지막 초기화 되돌리기',
    resetUndone: '저장된 코드와 실습 단계를 그대로 복원했습니다. 확인하려면 미리보기를 다시 실행하세요.',
    resetDone: '새 실습을 시작했습니다. 이전 초안과 단계는 한 번 복원할 수 있습니다. 미리보기 실행과 확인 기록은 복원 기록을 지우지 않으며, 초안 수정이나 다시 초기화하면 끝납니다.',
    resetEmptyDone: '새 실습을 시작했습니다. 복원할 이전 초안이나 진행 단계가 없습니다.',
    resetStorageIssue: '이 탭에서 새 실습을 시작했지만 브라우저 저장소를 갱신하거나 비울 수 없습니다. 되돌리기는 현재 탭에서만 가능하며, 새로고침하면 이전 초안이 돌아오고 되돌리기는 사라질 수 있습니다.',
    resetUndoStorageIssue: '이 탭에는 초안을 복원했지만 브라우저 저장소를 갱신하지 못했습니다. 미리보기를 다시 실행하세요. 새로고침하면 저장된 내용이 돌아올 수 있습니다.',
    reset: '실습 처음부터 다시 하기',
  },
} as const;

const buttonClass = 'rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
const secondaryClass = 'rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-white transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
const editorClass = 'mt-2 block w-full rounded-lg border border-border bg-[#111827] p-3 font-mono text-sm leading-6 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const EMPTY_LESSON_STATE: LessonState = { ...BUTTON_LESSON_STARTER, stage: 0, check: null, revision: 0, unchangedRevision: null, repairRevision: null };
const storageConflictCopy = {
  ko: {
    conflict: '다른 탭에서 같은 코드 파일을 다르게 저장했습니다. 이 탭의 코드는 유지했습니다. 저장할 값을 선택하세요.',
    saveMine: '내 파일 저장', useSaved: '저장된 파일 사용', mineSaved: '내 파일을 저장했습니다.', savedChosen: '저장된 파일을 사용합니다.',
    changedAgain: '선택하는 동안 다른 탭에서 파일이 다시 바뀌었습니다. 최신 저장값을 확인하고 다시 선택하세요.',
    cleared: '다른 탭에서 브라우저 저장 자료가 지워졌습니다. 이 탭의 편집은 유지되지만 새로고침하면 사라질 수 있습니다.',
    outputChanged: '다른 탭에서 저장된 실습 내용을 바꿨습니다.',
  },
  en: {
    conflict: 'Another tab saved a different version of the same code file. This tab kept your code. Choose which value to keep.',
    saveMine: 'Save my file', useSaved: 'Use saved file', mineSaved: 'Your file was saved.', savedChosen: 'The saved file is now in this tab.',
    changedAgain: 'The file changed again while choosing. Review the latest saved value and choose again.',
    cleared: 'Browser data was cleared in another tab. This tab keeps your edits, but refreshing may lose them.',
    outputChanged: 'A saved lesson draft changed in another tab.',
  },
} as const;

function readStoredLessonState(): LessonState {
  const raw = window.localStorage.getItem(BUTTON_LESSON_STORAGE_KEY);
  if (!raw) return EMPTY_LESSON_STATE;
  if (raw.length > 50_000) throw new Error('Saved lesson is too large to confirm.');
  const parsed = readButtonLessonState(JSON.parse(raw));
  if (!parsed) throw new Error('Saved lesson format could not be confirmed.');
  return parsed;
}

function mergeLessonState(base: LessonState, local: LessonState, remote: LessonState) {
  const files = mergeThreeWayFields(base, local, remote, ['html', 'css', 'javascript']);
  const common: LessonState = {
    ...remote,
    ...files.value,
    stage: Math.max(local.stage, remote.stage),
    revision: Math.max(local.revision, remote.revision),
    check: local.check !== base.check && remote.check === base.check ? local.check : remote.check,
    unchangedRevision: local.unchangedRevision !== base.unchangedRevision && remote.unchangedRevision === base.unchangedRevision ? local.unchangedRevision : remote.unchangedRevision,
    repairRevision: local.repairRevision !== base.repairRevision && remote.repairRevision === base.repairRevision ? local.repairRevision : remote.repairRevision,
  };
  const baseline: LessonState = { ...common };
  for (const field of ['html', 'css', 'javascript'] as const) baseline[field] = files.baseline[field];
  const display: LessonState = { ...common };
  for (const field of files.conflicts as Field[]) display[field] = local[field];
  return { stored: common, baseline, display, conflicts: files.conflicts as Field[] };
}

function signatureOf(draft: Draft) {
  return JSON.stringify([draft.html, draft.css, draft.javascript]);
}

export default function ButtonMessageLesson({ locale = 'ko' }: { locale?: Locale }) {
  const ui = copy[locale];
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const [draft, setDraft] = useState<Draft>(BUTTON_LESSON_STARTER);
  const [stage, setStage] = useState(0);
  const [check, setCheck] = useState<Check>(null);
  const [revision, setRevision] = useState(0);
  const [unchangedRevision, setUnchangedRevision] = useState<number | null>(null);
  const [repairRevision, setRepairRevision] = useState<number | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [previewSignature, setPreviewSignature] = useState('');
  const [previewRun, setPreviewRun] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const [writeRequested, setWriteRequested] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const baselineRef = useRef<LessonState>(EMPTY_LESSON_STATE);
  const currentStateRef = useRef<LessonState>(EMPTY_LESSON_STATE);
  const conflictRemoteRef = useRef<Partial<Record<Field, string>>>({});
  const storageBlockedRef = useRef(false);
  const [conflictedFields, setConflictedFields] = useState<Field[]>([]);
  const [previewError, setPreviewError] = useState('');
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [showErrorHint, setShowErrorHint] = useState(false);
  const [previewMismatch, setPreviewMismatch] = useState<{ selector: string; expected: string; element: 'button' | 'message' } | null>(null);
  const [expectedMessage, setExpectedMessage] = useState('');
  const [previewReadyNotice, setPreviewReadyNotice] = useState(false);
  const [editedThisVisit, setEditedThisVisit] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<LessonState | null>(null);
  const [notice, setNotice] = useState('');
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const resetDialogRef = useRef<HTMLDialogElement>(null);
  const previewResultRef = useRef<HTMLDivElement>(null);
  const editorRefs = useRef<Record<Field, HTMLTextAreaElement | null>>({ html: null, css: null, javascript: null });
  const currentSignature = useMemo(() => signatureOf(draft), [draft]);
  currentStateRef.current = { ...draft, stage, check, revision, unchangedRevision, repairRevision };
  const previewIsCurrent = Boolean(previewDocument && previewSignature === currentSignature);
  const hasDraftChanges = currentSignature !== signatureOf(BUTTON_LESSON_STARTER);
  const currentDraftStatus = previewError ? ui.currentFailed
    : previewIsCurrent ? ui.currentReady
      : editedThisVisit ? ui.currentEdited
        : previewRun === 0 && (hasDraftChanges || stage > 0) ? ui.currentResumed : ui.currentNotRun;
  const freshAfterUnchanged = unchangedRevision === null || revision > unchangedRevision;
  const canRecordBehavior = previewIsCurrent && freshAfterUnchanged;
  const canConfirmRepair = previewIsCurrent && check === 'changed' && unchangedRevision === null;
  const canConfirmVariation = previewIsCurrent && repairRevision !== null && revision > repairRevision;

  const applyLessonSnapshot = (snapshot: LessonState) => {
    const previous = currentStateRef.current;
    currentStateRef.current = snapshot;
    if (signatureOf(previous) !== signatureOf(snapshot)) {
      setPreviewDocument(null); setPreviewSignature(''); setPreviewError(''); setDiagnostic(null);
      setPreviewMismatch(null); setExpectedMessage(''); setPreviewReadyNotice(false);
    }
    setDraft({ html: snapshot.html, css: snapshot.css, javascript: snapshot.javascript });
    setStage(snapshot.stage); setCheck(snapshot.check); setRevision(snapshot.revision);
    setUnchangedRevision(snapshot.unchangedRevision); setRepairRevision(snapshot.repairRevision);
  };

  useEffect(() => {
    let canWrite = true;
    try {
      const raw = window.localStorage.getItem(BUTTON_LESSON_STORAGE_KEY);
      if (raw) {
        const saved = readButtonLessonState(JSON.parse(raw));
        if (saved) {
          baselineRef.current = saved;
          setDraft({ html: saved.html, css: saved.css, javascript: saved.javascript });
          setStage(saved.stage);
          setCheck(saved.check);
          setRevision(saved.revision);
          setUnchangedRevision(saved.unchangedRevision);
          setRepairRevision(saved.repairRevision);
        setStorageMessage(copy[localeRef.current].storageResumed);
        } else {
          canWrite = false;
          setStorageMessage(copy[localeRef.current].storageInvalid);
        }
      }
      const undoRaw = window.localStorage.getItem(BUTTON_LESSON_UNDO_STORAGE_KEY);
      if (undoRaw) {
        const savedUndo = readButtonLessonUndoSnapshot(JSON.parse(undoRaw));
        if (savedUndo) setUndoSnapshot(savedUndo);
      }
    } catch {
      canWrite = false;
      setStorageMessage(ui.storageUnavailable);
    }
    setWriteRequested(false);
    if (canWrite) setStorageReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null) {
        storageBlockedRef.current = true;
        setStorageReady(false); setWriteRequested(false); setStorageMessage(storageConflictCopy[localeRef.current].cleared);
        return;
      }
      if (event.key !== BUTTON_LESSON_STORAGE_KEY) return;
      try {
        const remote = readStoredLessonState();
        const local = currentStateRef.current;
        const merged = mergeLessonState(baselineRef.current, local, remote);
        baselineRef.current = merged.baseline;
        conflictRemoteRef.current = Object.fromEntries(merged.conflicts.map((field) => [field, remote[field]]));
        setConflictedFields(merged.conflicts);
        applyLessonSnapshot(merged.display);
        setStorageMessage(merged.conflicts.length ? storageConflictCopy[localeRef.current].conflict : storageConflictCopy[localeRef.current].outputChanged);
      } catch {
        storageBlockedRef.current = true;
        setStorageReady(false); setStorageMessage(copy[localeRef.current].storageInvalid);
      }
    };
    if (typeof window.addEventListener !== 'function') return;
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener?.('storage', onStorage);
  }, []);

  useEffect(() => {
    const dialog = resetDialogRef.current;
    if (!dialog) return;
    if (resetDialogOpen && !dialog.open) {
      dialog.showModal();
      resetCancelRef.current?.focus();
    } else if (!resetDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [resetDialogOpen]);

  useEffect(() => {
    if (!writeRequested) return;
    setWriteRequested(false);
    if (!storageReady || storageBlockedRef.current) return;
    try {
      const local: LessonState = { ...draft, stage, check, revision, unchangedRevision, repairRevision };
      const remote = readStoredLessonState();
      const merged = mergeLessonState(baselineRef.current, local, remote);
      window.localStorage.setItem(BUTTON_LESSON_STORAGE_KEY, JSON.stringify(merged.stored));
      baselineRef.current = merged.baseline;
      conflictRemoteRef.current = Object.fromEntries(merged.conflicts.map((field) => [field, remote[field]]));
      setConflictedFields(merged.conflicts);
      applyLessonSnapshot(merged.display);
      setStorageMessage(merged.conflicts.length ? storageConflictCopy[locale].conflict : ui.storageReady);
    } catch {
      setStorageMessage(ui.storageUnavailable);
    }
  }, [draft, stage, check, revision, unchangedRevision, repairRevision, storageReady, writeRequested, locale, ui.storageReady, ui.storageUnavailable]);

  const clearUndoSnapshot = () => {
    if (!undoSnapshot) return;
    setUndoSnapshot(null);
    try { window.localStorage.removeItem(BUTTON_LESSON_UNDO_STORAGE_KEY); } catch { /* Keep the current tab usable when storage is blocked. */ }
  };

  const closeResetDialog = () => {
    setResetDialogOpen(false);
    window.requestAnimationFrame(() => resetButtonRef.current?.focus());
  };

  const markEdited = (field: Field, value: string) => {
    if (value.length > BUTTON_LESSON_MAX_FIELD_LENGTH) {
      setNotice(ui.fieldLimit);
      return;
    }
    if (value === draft[field]) return;
    clearUndoSnapshot();
    setDraft((current) => ({ ...current, [field]: value }));
    setEditedThisVisit(true);
    setRevision((current) => current + 1);
    setCheck(null);
    setPreviewDocument(null);
    setPreviewSignature('');
    setPreviewError('');
    setDiagnostic(null);
    setShowErrorHint(false);
    setPreviewMismatch(null);
    setExpectedMessage('');
    setPreviewReadyNotice(false);
    setNotice('');
    setWriteRequested(true);
  };

  const resolveFieldConflict = (field: Field, keepLocal: boolean) => {
    const local = currentStateRef.current;
    const previousBaseline = baselineRef.current;
    const unresolved = conflictedFields.filter((value) => value !== field);
    try {
      const remote = readStoredLessonState();
      if (keepLocal && !sameStoredValue(remote[field], conflictRemoteRef.current[field])) {
        conflictRemoteRef.current[field] = remote[field];
        setStorageMessage(storageConflictCopy[locale].changedAgain);
        return;
      }
      const chosen = keepLocal ? local[field] : remote[field];
      const stored: LessonState = { ...(keepLocal ? remote : remote), [field]: chosen };
      if (keepLocal) window.localStorage.setItem(BUTTON_LESSON_STORAGE_KEY, JSON.stringify(stored));
      const nextBaseline: LessonState = { ...stored };
      const display: LessonState = { ...(keepLocal ? stored : local), [field]: chosen };
      for (const other of unresolved) {
        nextBaseline[other] = previousBaseline[other];
        display[other] = local[other];
      }
      baselineRef.current = nextBaseline;
      conflictRemoteRef.current = Object.fromEntries(unresolved.map((other) => [other, remote[other]]));
      setConflictedFields(unresolved);
      applyLessonSnapshot(display);
      setStorageReady(true); storageBlockedRef.current = false;
      setStorageMessage(keepLocal ? storageConflictCopy[locale].mineSaved : storageConflictCopy[locale].savedChosen);
    } catch {
      setStorageMessage(ui.storageUnavailable);
    }
  };

  const runPreview = () => {
    setCheck(null);
    setWriteRequested(true);
    const result = prepareButtonLessonPreview(draft.html, draft.css, draft.javascript);
    if (!result.ok) {
      setPreviewDocument(null);
      setPreviewSignature('');
      setPreviewMismatch(null);
      setPreviewError(ui.errorTitle);
      setDiagnostic({ ...result.diagnostic, feature: result.feature });
      setShowErrorHint(false);
      setExpectedMessage('');
      setPreviewReadyNotice(false);
      setNotice('');
      return;
    }
    setPreviewDocument(result.document);
    setPreviewSignature(currentSignature);
    setPreviewMismatch(result.mismatch);
    setPreviewError('');
    setDiagnostic(null);
    setShowErrorHint(false);
    setExpectedMessage(result.expectedMessage);
    setPreviewReadyNotice(true);
    setPreviewRun((current) => current + 1);
    setEditedThisVisit(false);
    setStage((current) => Math.max(current, 1));
    setWriteRequested(true);
    setNotice('');
  };

  const recordBehavior = (result: Exclude<Check, null>) => {
    if (!canRecordBehavior) return;
    setCheck(result);
    setUnchangedRevision(result === 'unchanged' ? revision : null);
    setStage((current) => Math.max(current, 2));
    setWriteRequested(true);
  };

  const resetLesson = () => {
    setResetDialogOpen(true);
  };

  const confirmResetLesson = () => {
    const priorState: LessonState = { ...draft, stage, check, revision, unchangedRevision, repairRevision };
    const hasSavedWork = hasDraftChanges || stage > 0 || check !== null || revision > 0;
    const snapshot = hasSavedWork ? createButtonLessonUndoSnapshot(priorState) : null;
    let canWrite = false;
    try {
      if (snapshot) window.localStorage.setItem(BUTTON_LESSON_UNDO_STORAGE_KEY, JSON.stringify(snapshot));
      else window.localStorage.removeItem(BUTTON_LESSON_UNDO_STORAGE_KEY);
      window.localStorage.removeItem(BUTTON_LESSON_STORAGE_KEY);
      canWrite = true;
      baselineRef.current = EMPTY_LESSON_STATE;
      conflictRemoteRef.current = {};
      setConflictedFields([]);
      storageBlockedRef.current = false;
    } catch {
      // Keep the in-memory undo snapshot, and do not write the fresh starter over an old saved draft.
    }
    setUndoSnapshot(snapshot?.state || null);
    setDraft(BUTTON_LESSON_STARTER);
    setStage(0);
    setCheck(null);
    setRevision(0);
    setUnchangedRevision(null);
    setRepairRevision(null);
    setPreviewDocument(null);
    setPreviewSignature('');
    setPreviewError('');
    setDiagnostic(null);
    setShowErrorHint(false);
    setPreviewMismatch(null);
    setExpectedMessage('');
    setPreviewReadyNotice(false);
    setPreviewRun(0);
    setEditedThisVisit(false);
    setStorageReady(canWrite);
    setWriteRequested(false);
    setNotice('');
    setStorageMessage(canWrite
      ? snapshot ? ui.resetDone : ui.resetEmptyDone
      : ui.resetStorageIssue);
    closeResetDialog();
  };

  const undoReset = () => {
    if (!undoSnapshot) return;
    const restored: LessonState = undoSnapshot;
    let canWrite = false;
    let display = restored;
    try {
      const remote = readStoredLessonState();
      if (!sameStoredValue(remote, baselineRef.current)) {
        setStorageMessage(locale === 'ko'
          ? '다른 탭에서 실습 기록이 바뀌어 복원을 보류했습니다. 현재 저장값을 확인한 뒤 다시 복원하세요.'
          : 'Another tab changed the lesson. Undo was kept. Review the current saved value before restoring.');
        return;
      }
      // Undo is an explicit snapshot restoration, including its exact stage.
      window.localStorage.setItem(BUTTON_LESSON_STORAGE_KEY, JSON.stringify(restored));
      baselineRef.current = restored;
      conflictRemoteRef.current = {};
      setConflictedFields([]);
      window.localStorage.removeItem(BUTTON_LESSON_UNDO_STORAGE_KEY);
      canWrite = true;
    } catch {
      // Restore the in-tab copy even if browser storage has become unavailable.
    }
    applyLessonSnapshot(display);
    setPreviewDocument(null);
    setPreviewSignature('');
    setPreviewError('');
    setDiagnostic(null);
    setShowErrorHint(false);
    setPreviewMismatch(null);
    setExpectedMessage('');
    setPreviewReadyNotice(false);
    setPreviewRun((current) => current + 1);
    setEditedThisVisit(false);
    setStorageReady(canWrite);
    storageBlockedRef.current = !canWrite;
    setWriteRequested(false);
    setUndoSnapshot(null);
    setStorageMessage(canWrite
      ? ui.resetUndone
      : ui.resetUndoStorageIssue);
    window.requestAnimationFrame(() => resetButtonRef.current?.focus());
  };

  const locateDiagnostic = () => {
    if (!diagnostic) return;
    const editor = editorRefs.current[diagnostic.file];
    if (!editor) return;
    editor.focus();
    const lines = editor.value.split('\n');
    const offset = lines.slice(0, diagnostic.line - 1).reduce((sum, line) => sum + line.length + 1, 0) + diagnostic.column - 1;
    editor.setSelectionRange(Math.max(0, offset), Math.max(0, offset));
  };

  const goToPreview = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    previewResultRef.current?.scrollIntoView({ block: 'start', behavior });
    previewResultRef.current?.focus({ preventScroll: true });
  };

  const goToStarter = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const starter = document.getElementById('button-lesson-starter');
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    starter?.scrollIntoView({ block: 'start', behavior });
    starter?.focus({ preventScroll: true });
  };

  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
    <header className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">HTML · CSS · JavaScript</p>
      <h1 className="text-3xl font-bold sm:text-4xl">{ui.title}</h1>
      <p className="max-w-3xl text-text-secondary">{ui.intro}</p>
      <section className="rounded-xl border border-border bg-surface p-4" aria-labelledby="lesson-difference">
        <h2 id="lesson-difference" className="font-semibold">{ui.differenceTitle}</h2>
        <p className="mt-2 text-sm text-text-secondary">{ui.difference}</p>
      </section>
    </header>

    <section id="button-lesson-starter" tabIndex={-1} className="scroll-mt-20 rounded-2xl border border-border bg-surface p-4 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-labelledby="starter-title">
      <h2 id="starter-title" className="text-xl font-bold">{ui.starter}</h2>
      <p className="mt-2 text-sm text-text-secondary">{ui.edit}</p>
      <p className="mt-2 text-sm text-text-secondary">{ui.starterBody}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {(['html', 'css', 'javascript'] as const).map((field) => <label key={field} className="block min-w-0 text-sm font-semibold" htmlFor={`button-lesson-${field}`}>
          {ui[field]}
          <textarea
            ref={(element) => { editorRefs.current[field] = element; }}
            id={`button-lesson-${field}`}
            className={editorClass}
            rows={field === 'javascript' ? 9 : 11}
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={diagnostic?.file === field || undefined}
            aria-describedby={diagnostic?.file === field ? 'button-lesson-error-summary' : undefined}
            value={draft[field]}
            onChange={(event) => markEdited(field, event.target.value)}
          />
        </label>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className={buttonClass} onClick={runPreview}>{previewDocument ? ui.rerun : ui.run}</button>
        {notice && <p className="text-sm text-amber-300" role="status">{notice}</p>}
      </div>
      {previewError && diagnostic && <div id="button-lesson-error-summary" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100" role="alert" aria-live="assertive">
        <p className="font-semibold">{previewError}</p>
        <p className="mt-2">{ui.errorPosition(ui.fileNames[diagnostic.file], diagnostic.line, diagnostic.column)}: {ui.errorMessage(diagnostic.code, diagnostic.feature || '')}</p>
        {ui.errorExample(diagnostic.code) && <p className="mt-2"><span className="font-semibold">{locale === 'ko' ? '수정 예시' : 'Example repair'}: </span><code className="rounded bg-black/30 px-1.5 py-0.5">{ui.errorExample(diagnostic.code)}</code></p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={secondaryClass} onClick={locateDiagnostic}>{ui.locateLine}</button>
          <button type="button" className="text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-controls="button-lesson-error-hint" aria-expanded={showErrorHint} onClick={() => setShowErrorHint((visible) => !visible)}>{showErrorHint ? ui.hideHint : ui.showHint}</button>
        </div>
        {showErrorHint && <p id="button-lesson-error-hint" className="mt-3 border-l-2 border-amber-300 pl-3 text-amber-100">{ui.errorHint(diagnostic.code)}</p>}
      </div>}
      {previewReadyNotice && <p className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary" role="status" aria-live="polite">
        {ui.previewReady} <a className="ml-2 font-semibold underline underline-offset-2" href="#button-lesson-preview-result" onClick={goToPreview}>{ui.previewAnchor}</a>
      </p>}
    </section>

    <section id="button-lesson-preview" className="scroll-mt-20 rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="preview-title">
      <h2 id="preview-title" className="text-xl font-bold">{ui.previewTitle}</h2>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{ui.previewSafety}</p>
      <div id="button-lesson-preview-result" ref={previewResultRef} role="region" aria-labelledby="preview-title" tabIndex={-1} className="mt-4 scroll-mt-20 overflow-hidden rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary">
        {previewDocument ? <iframe
          key={`${previewSignature}:${previewRun}`}
          title={ui.previewTitle}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          className="block h-[min(36rem,80vh)] w-full bg-white"
          srcDoc={previewDocument}
        /> : <p className="min-h-[22rem] p-6 text-sm text-slate-700">{ui.notRun}</p>}
      </div>
      {previewIsCurrent && <p className="mt-3 text-sm text-text-secondary">{ui.locatePreview} <a className="ml-2 font-semibold text-primary underline underline-offset-2" href="#button-lesson-starter" onClick={goToStarter}>{locale === 'ko' ? '코드 편집으로 돌아가기' : 'Back to code'}</a></p>}
    </section>

    {stage >= 1 && <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="expected-title">
      <h2 id="expected-title" className="text-xl font-bold">{ui.expected}</h2>
      <p className="mt-2 text-sm text-text-secondary">{ui.expectedBody(expectedMessage)}</p>
      <p className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-text-secondary" role="status" aria-live="polite"><span className="font-semibold">{ui.currentDraft}: </span>{currentDraftStatus}</p>
      <div className="mt-4 rounded-lg border border-border bg-background p-4" role="note">
        <p className="font-semibold">{ui.codeHint}</p>
        <p className="mt-2 text-sm text-text-secondary">{!previewIsCurrent
          ? ui.previewRequired
          : previewMismatch
            ? previewMismatch.element === 'button'
              ? ui.missingButton(previewMismatch.selector, previewMismatch.expected)
              : ui.missingMessage(previewMismatch.selector, previewMismatch.expected)
            : ui.noMismatch}</p>
      </div>
      <fieldset className="mt-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold">{ui.manual}</legend>
        <p className="mb-3 text-sm text-text-secondary">{ui.selfReport}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={check === 'changed' ? buttonClass : secondaryClass} aria-pressed={check === 'changed'} disabled={!canRecordBehavior} onClick={() => recordBehavior('changed')}>{ui.changed}</button>
          <button type="button" className={check === 'unchanged' ? buttonClass : secondaryClass} aria-pressed={check === 'unchanged'} disabled={!canRecordBehavior} onClick={() => recordBehavior('unchanged')}>{ui.unchanged}</button>
        </div>
      </fieldset>
    </section>}

    {stage >= 2 && <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="repair-title">
      <h2 id="repair-title" className="text-xl font-bold">{ui.repair}</h2>
      <p className="mt-2 text-sm text-text-secondary">{ui.repairBody}</p>
      <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100" role="status">
        {!previewIsCurrent
          ? ui.previewRequired
          : check === 'unchanged' && previewMismatch
            ? previewMismatch.element === 'button'
              ? ui.missingButton(previewMismatch.selector, previewMismatch.expected)
              : ui.missingMessage(previewMismatch.selector, previewMismatch.expected)
            : check === 'unchanged' ? ui.noMismatch : ui.selfReport}
      </p>
      <button type="button" className={`${buttonClass} mt-4`} disabled={!canConfirmRepair} onClick={() => { setRepairRevision(revision); setStage((current) => Math.max(current, 3)); setWriteRequested(true); }}>{ui.repairConfirm}</button>
      {!canConfirmRepair && <p className="mt-2 text-sm text-text-secondary">{!previewIsCurrent
        ? ui.repairNeedRun
        : unchangedRevision !== null && !freshAfterUnchanged
          ? ui.repairNeedFresh
          : ui.repairNeedChanged}</p>}
    </section>}

    {stage >= 3 && <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="variation-title">
      <h2 id="variation-title" className="text-xl font-bold">{ui.variation}</h2>
      <p className="mt-2 text-sm text-text-secondary">{ui.variationBody}</p>
      <button type="button" className={`${buttonClass} mt-4`} disabled={!canConfirmVariation} onClick={() => { setStage(BUTTON_LESSON_LAST_STAGE); setWriteRequested(true); }}>{ui.variationConfirm}</button>
      {!canConfirmVariation && <p className="mt-2 text-sm text-text-secondary">{ui.variationNeedEditRun}</p>}
    </section>}

    {stage >= BUTTON_LESSON_LAST_STAGE && <section className="rounded-2xl border border-primary/40 bg-surface p-4 sm:p-6" aria-labelledby="resume-title">
      <h2 id="resume-title" className="text-xl font-bold">{ui.resume}</h2>
      <p className="mt-2 text-sm text-text-secondary">{ui.resumeBody}</p>
      <p className="mt-3 text-sm text-text-secondary">{ui.pastProgress(stage)}</p>
      <p className="mt-3 text-sm text-primary" role="status">{ui.stage(stage)}</p>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-secondary">
      <div className="min-w-0 flex-1 space-y-2">
        <p role="status" aria-live="polite">{storageMessage}</p>
        {conflictedFields.map((field) => <div key={field} role="alert" aria-live="assertive" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><p>{ui[field]}: {storageConflictCopy[locale].conflict}</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" className={secondaryClass} onClick={() => resolveFieldConflict(field, true)}>{storageConflictCopy[locale].saveMine}</button><button type="button" className={secondaryClass} onClick={() => resolveFieldConflict(field, false)}>{storageConflictCopy[locale].useSaved}</button></div></div>)}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {undoSnapshot && <button id="button-lesson-reset-undo" type="button" className={secondaryClass} onClick={undoReset}>{ui.resetUndo}</button>}
        <button ref={resetButtonRef} type="button" className={secondaryClass} onClick={resetLesson}>{ui.reset}</button>
      </div>
    </footer>

    <dialog
      id="button-lesson-reset-dialog"
      ref={resetDialogRef}
      className="m-auto w-[min(92vw,32rem)] rounded-xl border border-border bg-surface p-0 text-white shadow-2xl backdrop:bg-black/70"
      aria-labelledby="button-lesson-reset-title"
      aria-describedby="button-lesson-reset-description"
      onCancel={(event) => { event.preventDefault(); closeResetDialog(); }}
    >
      <div className="space-y-4 p-5 sm:p-6">
        <h2 id="button-lesson-reset-title" className="text-lg font-bold">{ui.resetDialogTitle}</h2>
        <p id="button-lesson-reset-description" className="text-sm leading-6 text-text-secondary">{ui.resetDialogBody}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button id="button-lesson-reset-cancel" ref={resetCancelRef} type="button" className={secondaryClass} onClick={closeResetDialog}>{ui.resetCancel}</button>
          <button id="button-lesson-reset-confirm" type="button" className={buttonClass} onClick={confirmResetLesson}>{ui.resetConfirm}</button>
        </div>
      </div>
    </dialog>
  </div>;
}
