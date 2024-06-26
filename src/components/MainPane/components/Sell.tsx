import { useState, type ChangeEvent, type FC, type MouseEvent } from "react";

import { Button, Input, VStack, FormLabel } from "@chakra-ui/react";
import { simulateContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";

import { useNotify } from "@/hooks";
import { SMART_CONTRACT_ADDRESS } from "@/utils/constants";

import { abi } from "../../../contracts/abi";
import { wagmiConfig } from "../../../wagmi";

interface SellProps {
  refreshData: () => void;
}

const Sell: FC<SellProps> = ({ refreshData }): JSX.Element => {
  const [value, setValue] = useState<number>(100);
  const { notifyError, notifySuccess } = useNotify();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    try {
      if (Number(e.target.value) < 100) {
        setValue(Number(100));
      } else {
        setValue(Number(e.target.value));
        // console.log("ok");
      }
    } catch (error) {
      console.error("Error parsing input: ", error);
      setValue(Number(100));
    }
  };

  const handleSell = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    SellToken();
  };

  const SellToken = async () => {
    const finalValue = BigInt(value * 1e18);

    const { request } = await simulateContract(wagmiConfig, {
      abi,
      address: SMART_CONTRACT_ADDRESS,
      functionName: "redeemTokens",
      args: [finalValue],
    });

    const hash = await writeContract(wagmiConfig, request);
    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: hash });

    if (receipt.status === "success") {
      notifySuccess({
        title: "Successfully Sold tokens!",
        message: (
          <>
            <b>MTT3 amount:</b> {value}
            <br />
          </>
        ),
      });
      // Call the parent's refreshData function
      refreshData();
    } else {
      console.log("Transaction failed: ", hash);
      notifyError({
        title: "An error occurred:",
        message: hash,
      });
    }
  };

  return (
    <VStack w={"45%"} minWidth={"270px"} gap={2}>
      <FormLabel htmlFor="sell">Sell MTT3 to get ETH back</FormLabel>
      <Input
        onChange={handleInputChange}
        type="number"
        step={0.00001}
        min={0.00001}
        placeholder="Enter The number of Tokens to Sell"
      />
      <Button variant="ghost" className="custom-button2" onClick={handleSell}>
        Sell
      </Button>
    </VStack>
  );
};

export default Sell;
