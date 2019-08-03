# Whitespace Cropper

Automatically detects and removes white borders around images using HTML5 Canvas API, optionally calculating proper aspect ratio like css property ```background-size: cover```

Pull requests are welcome

### How to use
- Include the script in your page
- Call the "attachToImages" functions with your config

```
attachToImages({
  shouldCover: true, //calculate aspect ratio to be similar like background-size: cover
  selector: "img" //selector
});
```

- Thats it 🎉

#### Todo
Make color to remove a variable, so we can remove black areas as well.