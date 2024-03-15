# Tandem Collabo

Tandem Collabo offers an innovative approach to enhancing language learning through text correction. It simplifies the process of correcting text during language exchanges. If you receive a message in your native language from your conversation partner that needs correction, Tandem Collabo enables you to correct it, annotate your corrections, and share a link with your partner. This way, they can easily view your corrections and notes, facilitating a better learning experience.

Try out Tandem Collabo by visiting **https://tandem.omg.lol/**.

## How It Works

Tandem Collabo is user-friendly, designed to perform seamlessly across desktop, tablet, and mobile browsers.

To begin, simply paste the text you wish to correct into the provided text box and click "Next".

![image](https://github.com/shuuryou/tandemcollabo/assets/36278767/a9727182-936b-4ae7-8bf6-9534e7f2345b)

Proceed to correct the text as needed. Once done, click "Next" to continue.

![image](https://github.com/shuuryou/tandemcollabo/assets/36278767/f06e3d04-7f44-4b1b-8ace-a2bfaf0e7d35)

A preview of your corrections will be displayed next. You have the option to add notes to specific corrections by selecting the text and clicking "Add Note". Notes will appear as underlined text. Click on any underlined text to edit a note. To delete a note, edit it and remove its text. Once you're satisfied with your corrections and notes, click "Next" to proceed.

![image](https://github.com/shuuryou/tandemcollabo/assets/36278767/715ab398-f4ed-48c6-a07c-aa5d6cdc1de6)

In the final step, a shareable link will be generated. Copy this link and share it with your conversation partner.

![image](https://github.com/shuuryou/tandemcollabo/assets/36278767/18d98ebc-2520-4831-bb36-0db56ceee8da)

Upon accessing the link, your partner will be presented with a read-only view showcasing both the original and corrected texts, alongside any notes. Notes can be viewed in a modal overlay by clicking or tapping on them.

![image](https://github.com/shuuryou/tandemcollabo/assets/36278767/fcd0b547-c7d5-402c-8552-a67587e70f9e)

## License

Tandem Collabo is released under the Server Side Public License (SSPL). Utilizing this project within your website or service mandates that your entire source code, inclusive of all software, APIs, and dependencies necessary for running your service, be disclosed under the SSPL.

To preserve the uniqueness of Tandem Collabo, I kindly request that additional public instances not be created. However, private use for you and your friends is acceptable, because I would probably never notice.

Feel free to link to the official Tandem Collabo instance at https://tandem.omg.lol/ from your website without restriction.

## Help Wanted

Contributions to Tandem Collabo are warmly welcomed.

The project, initially developed in approximately six hours (half of that time spent fighting mobile Safari browser bugs and the text selection API, before giving up and using [Rangy](https://github.com/FL3XX-dev/rangy)), would greatly benefit visual design enhnancements.

Tandem Collabo is compatible with a basic Apache + PHP stack, with verified functionality on XAMPP. Required PHP extensions include `mb_string` and `sqlite`, with SQLite accessed via PDO.

Attention is drawn to a necessary patch for the [yetanotherape/diff-match-patch](https://github.com/yetanotherape/diff-match-patch) library, available at `src/do_not_upload/diffmatchpatch_changes.patch`.

I would be particularly interested in:
- UI translations
- Enhancements to aesthetics and usability
- Code improvements where they make sense

At this time, I am not seeking invasive changes, such as:
- User registration systems
- Alternative database support beyond SQLite
- Automatic link expiry (okay, that one isn't very invasive)
- Integration of frameworks like Symfony, Laravel, etc.
- Introduction of unnecessary complexity or bloat

By contributing, you'll help make Tandem Collabo an even more valuable resource for language learners worldwide.
