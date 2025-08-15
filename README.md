# Nithin's time entry

<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/codebynithin/time-entry">
    <img src="./favicon.png" alt="Logo" width="80" height="80">
  </a>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About </a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <!-- <li><a href="#installation">Installation</a></li> -->
        <li><a href="#commands">Commands</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About time entry

If you find yourself struggling with the intricacies of our work time entry system, rest assured, you're not alone. We understand that navigating complex systems can be daunting, but fear not! We're here to provide you with a simple and efficient alternative command line tool that will make tracking and updating your time a breeze. Our goal is to streamline your workflow and ensure that you can focus on your tasks without the added stress of wrestling with unfamiliar software. With our CLI, you'll be able to seamlessly record your time with ease, allowing you to devote more energy to your work and less time worrying about administrative tasks. So why wait? Let us simplify your time-tracking process today!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To take full advantage of our comprehensive time-tracking solution, you can get started with ease by following a straightforward process. First, initiate the installation process by running `npm install -g @mails2nithin/time-entry` to seamlessly install the application onto your local machine. Once the installation is successfully completed, the next step involves configuring the app to tailor it to your specific requirements. This can be effortlessly achieved by entering the `timecli init` command, which prompts you to provide a few key inputs to set up the application according to your preferences.

With just a few simple inputs, you'll unlock access to a robust tool that streamlines the entire process of tracking and updating your time commitments. Bid farewell to the days of laborious manual entries, and usher in an era of enhanced efficiency and pinpoint accuracy in your time management endeavors.

Embrace the unparalleled convenience and peace of mind that our solution offers, empowering you to seamlessly navigate through your tasks and projects with utmost efficiency. Whether you're an individual working independently or part of a collaborative team, our time-tracking app is meticulously designed to cater to your unique needs, surpassing your expectations every step of the way.

Embark on a journey to optimize your productivity effortlessly, as you experience the transformative impact of our innovative time-tracking solution firsthand. Make today the day you elevate your productivity to unprecedented heights, with our user-friendly and feature-rich application at your disposal.

### Prerequisites

To use the software effectively, there are several prerequisites you must meet. First and foremost, you'll require a compatible device, whether it's a desktop computer or laptop. The software should be compatible with the operating system running on your device, whether it's Windows, macOS or Linux. Additionally, ensure that your device meets the minimum hardware requirements specified by the software developer to ensure smooth performance. It's also essential to have a stable internet connection, especially if the software relies on cloud-based services or requires frequent updates. Familiarity with basic computer skills and understanding of the software's functionalities will also be advantageous in navigating and utilizing its features effectively. By fulfilling these requirements, you can optimize your experience with the software and leverage its capabilities to their fullest extent.

- npm:

Open your terminal and execute the command mentioned BELOW to install or update npm to the latest version globally.

```sh
npm install npm@latest -g
```

### Commands

Now you can utilize the app with the following commands:

- The text provides instructions on how to initialize a process or system by executing a specific command. Upon executing this command, the system will prompt the user to input necessary information. This information typically includes key details or configurations required to set up or initialize the system properly. By following these instructions, users can ensure that the system is initialized correctly and ready for use. The command serves as a starting point for configuring the system, and the prompt ensures that users provide the essential information needed for the initialization process to proceed smoothly. Overall, the text offers clear guidance on how to initiate the setup process and emphasizes the importance of providing the necessary information as prompted.:

  ```sh
  timectl init
  ```

- The provided text instructs users on how to add a time entry within a system or application. It offers flexibility by presenting two alternative commands that users can choose from to accomplish this task. Additionally, it notes that there are optional fields that can be included in the time entry, namely the `project name` and `sprint`. The `project name` field is only necessary if the user has selected a default project during the initialization process. Including this field allows users to specify which project the time entry is associated with. Overall, the text provides clear guidance on how to add a time entry and highlights optional fields that users may consider including for further context or organization.

  ```sh
  timectl add -p <project name> -s <sprint> -t <task id> -dt <date in 'yyyy-mm-dd' format> -w <short description> -du <duration in minutes> -r <comments>
  ```

  or

  ```sh
  timectl add -project <project name> -sprint <sprint number> -date <date in 'yyyy-mm-dd' format> -task <task id> -work <short description> -duration <duration in minutes> -remarks <comments>
  ```

- The text offers guidance on how to update a time entry within a system or application. It provides a specific command that users can execute to initiate the update process. Additionally, it mentions that there are optional fields, namely `project name` and `sprint`, which users can include in the update command if necessary.

  ```sh
  timectl update -id <id of the current entry> -p <project name> -s <sprint> -t <task id> -dt <date in 'yyyy-mm-dd' format> -w <short description> -du <duration in minutes> -r <comments>
  ```

- To retrieve the time entries with details for the last week, use the command:

  ```sh
  timectl entries
  ```

- To retrieve time entries for a specific period, specify the start and end dates in the format `yyyy-mm-dd` using the following command:

  ```sh
  timectl entries -f <start_date> -t <end_date>
  ```

- To retrieve the time status for the last week, use the command:

  ```sh
  timectl status
  ```

- To retrieve time status for a specific period, specify the start and end dates in the format `yyyy-mm-dd` using the following command:

  ```sh
  timectl status -f <start_date> -t <end_date>
  ```

  Ensure to replace `<start_date>` and `<end_date>` with the desired dates in the specified format. This will allow you to effectively manage and track your time entries using the app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are welcomed and greatly appreciated! Here's how you can contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/YourFeature`)
3. Commit your Changes (`git commit -m 'Add some YourFeature'`)
4. Push to the Branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

If you have any suggestions for improvements or new features, feel free to open an issue with the "enhancement" tag. Don't forget to give the project a star if you find it useful. Thank you for your contributions!

If you encounter any bugs while using our service or have suggestions for improvement, we value your feedback immensely. Your input helps us enhance the user experience and ensure our platform operates smoothly. Please don't hesitate to reach out to us by **[clicking the link](mailto:incoming+nithinv86-time-entry-56105506-ahnteawx9z4nua5ckrbmjp23x-issue@incoming.gitlab.com)** to send us an email detailing any issues or suggestions you may have. We appreciate your contribution to making our product even better and look forward to hearing from you.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

This project is distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

If you have any questions or suggestions regarding the Time entry, feel free to reach out to Nithin V:

- Email: mails2nithin@gmail.com

Project Link: [https://github.com/nithinv86/time-entry](https://github.com/nithinv86/time-entry)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
