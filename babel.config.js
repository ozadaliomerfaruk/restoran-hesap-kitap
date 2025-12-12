module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@/shared": "./src/shared",
            "@/features": "./src/features",
            "@/store": "./src/store",
            "@/services": "./src/services",
            "@/types": "./src/types",
          },
        },
      ],
    ],
  };
};
