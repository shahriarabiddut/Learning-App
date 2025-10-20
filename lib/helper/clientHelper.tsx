export const formatAddress = (address: string) => {
  return address
    .split(",")
    .reduce((acc: string[][], part, i) => {
      const groupIndex = Math.floor(i / 2);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      acc[groupIndex].push(part.trim());
      return acc;
    }, [])
    .map((group, i) => (
      <span key={i}>
        {group.join(", ")}
        <br />
      </span>
    ));
};
