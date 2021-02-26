# On the spot Translator (Chrome Extension)

Just click and get the translation right below which keeps named entity in the original text.

## Usage & Features

- Hold down **Alt key** and **move the mouse cursor over** the desired text to translate.
	
	Then you **can see the yellow box** that tells you the range of the text.
	
	![image-20210224155925479](images/image-20210224155925479.png)

- **By one click**(with Alt), you can **see the translation right below the original text** 

  - In other words, you can **see the original and the translation at a glance**. So simple!
  - Above all, the result **keeps named entity in the original text**.
    This will help you understand the original text better, **especially with many jargon.**

  ![image-20210224160037537](images/image-20210224160037537.png)

- Currently, support English to Korean and Korean to English translation.

## Installation & Setting

1. Download the "On the spot Translator" from Chrome Web Store

   (Under Chrome Web Store review progress...)

2. Get a Naver Papago API key and enter Put it in the extension option.

   This extension based on Naver Papago API. So you should
   
   - Get the application `Client ID` and `Client Secret` of Naver developers center.
   - Enter them in this extension option.

For more detailed, see [this link](https://www.notion.so/uoneway/On-the-spot-Translator-1826d87aa2d845d093793cee0ca11b29).


## Update plan

- Improve NER logic
- Correct postposition after substitution token
- Make User-defined dictionary function
- Improve response speed

## Related Project

- The main part of the text processing is performed on REST-API server.

  [![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=uoneway&repo=On-the-spot-Translator-API&show_owner=True)](https://github.com/uoneway/On-the-spot-Translator-API)

- The text extraction function from HTML is based on the [copy-text-without-selecting-chrome](https://github.com/YujiSoftware/copy-text-without-selecting-chrome) of [YujiSoftware](https://github.com/YujiSoftware). 