import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReservationFrom from "../components/ReservationFrom";
import { httpClient } from "../api/axios";

const mockNavigate = vi.fn();

vi.mock("../api/axios", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../hooks/useAuthContext", () => ({
  default: () => ({
    user: { id: 42 },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../components/BookingCalendarField", () => ({
  default: function MockBookingCalendarField({
    id,
    label,
    onChange,
    disabled = false,
  }) {
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          aria-label={label}
          type="date"
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            if (value) {
              onChange(new Date(`${value}T00:00:00`));
            }
          }}
        />
      </div>
    );
  },
}));

describe("ReservationFrom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    httpClient.get.mockResolvedValue({ data: [] });
    httpClient.post.mockResolvedValue({ data: { id: 1 } });
  });

  it("submits a reservation and redirects the user", async () => {
    const user = userEvent.setup();

    render(
      <ReservationFrom boatId={7} isBoatActive={true} unavailableRanges={[]} />,
    );

    fireEvent.change(screen.getByLabelText("Foglalás kezdete"), {
      target: { value: "2026-05-10" },
    });

    fireEvent.change(screen.getByLabelText("Foglalás vége"), {
      target: { value: "2026-05-12" },
    });

    await user.click(screen.getByDisplayValue("Foglalás"));

    await waitFor(() => {
      expect(httpClient.post).toHaveBeenCalledWith("/api/reservations", {
        user_id: 42,
        boat_id: 7,
        status: "pending",
        start_date: "2026-05-10",
        end_date: "2026-05-12",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/reservations");
  });

  it("shows an error if the boat is inactive", async () => {
    const user = userEvent.setup();

    render(
      <ReservationFrom boatId={7} isBoatActive={false} unavailableRanges={[]} />,
    );

    await user.click(screen.getByDisplayValue("Foglalás"));

    expect(
      screen.getByText("Ez a hirdetés inaktív, ezért nem foglalható."),
    ).toBeInTheDocument();
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it("blocks submission when the selected dates overlap an approved reservation", async () => {
    render(
      <ReservationFrom
        boatId={7}
        isBoatActive={true}
        unavailableRanges={[
          {
            start_date: "2026-05-10",
            end_date: "2026-05-12",
            status: "approved",
          },
        ]}
      />,
    );

    await waitFor(() => {
      expect(httpClient.get).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText("Foglalás kezdete"), {
      target: { value: "2026-05-11" },
    });

    fireEvent.change(screen.getByLabelText("Foglalás vége"), {
      target: { value: "2026-05-13" },
    });

    expect(
      screen.getByText(
        "A kiválasztott intervallum ütközik egy jóváhagyott foglalással.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Foglalás")).toBeDisabled();
  });

  it("shows the backend error message when reservation creation fails", async () => {
    const user = userEvent.setup();
    httpClient.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Erre az időpontra már van jóváhagyott foglalás.",
        },
      },
    });

    render(
      <ReservationFrom boatId={7} isBoatActive={true} unavailableRanges={[]} />,
    );

    fireEvent.change(screen.getByLabelText("Foglalás kezdete"), {
      target: { value: "2026-05-15" },
    });

    fireEvent.change(screen.getByLabelText("Foglalás vége"), {
      target: { value: "2026-05-17" },
    });

    await user.click(screen.getByDisplayValue("Foglalás"));

    await waitFor(() => {
      expect(
        screen.getByText("Erre az időpontra már van jóváhagyott foglalás."),
      ).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
