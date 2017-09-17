<p align="center">
    <img alt="GraphQL IDE" src="https://rawgit.com/redound/graphql-ide/cbb88aa/assets/logo.svg" width="440">
</p>

<p align="center">
  An extensive IDE for exploring GraphQL API's
</p>

---

## Features

- Manage projects
- Import/export
- Store queries
- Query history
- Custom headers
- Environment variables for dynamic headers

## Installing

### MacOS

Unpack the latest app from the [releases][0] tab

### Window / Linux

Releases available soon, for now build the binary using

````
npm install -g electron
npm install
npm run package --all
````

Run the binary using `electron .`

## Upgrade from 0.x

Download the latest 0.2.x version, this will give you an option to export any project for 1.x.
After you've installed 1.x you can import the project there. You can always go back to 0.x, your project data is stored at
`/Users/[username]/Library/Application Support/graphql-ide`

## Contributing

Please file issues under GitHub, or submit a pull request if you'd like to directly contribute.

## Screenshots

<h3 align="center">
Execute queries
</h3>

![Execute queries](assets/screenshot-1.png)

<h3 align="center">
Custom headers
</h3>

![Custom headers](assets/screenshot-2.png)

<h3 align="center">
Environment variables for dynamic headers
</h3>

![Custom headers](assets/screenshot-3.png)

<h3 align="center">
Manage projects
</h3>

![Manage projects](assets/screenshot-4.png)

[0]: https://github.com/redound/graphql-ide/releases
